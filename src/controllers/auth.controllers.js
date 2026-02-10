import { User } from '../models/user.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generate Access and Refresh Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser) {
        throw new ApiError(409, "User with email or username already exist", [])
    }

    const user = await User.create({    // User is the monggose model, whatever function that you want to access you should access it from user ot the variable that is storing the data.
        email,
        password,
        username,
        isEmailVerified: false
    })

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
                // generating dynamic link:- req.protocol mean http or https, req.get("host") means the website domain address weather it is localhost or vaibhav.com and other is the route 
            )
        }
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something Went Wrong While Registering the User")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, {user: createdUser}, "User Registered Successfully and Verification Email has been send on your email")
    )
});


const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body

    if(!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email });

    if(!user) {
        throw new ApiError(400, "User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    // setting up cookies, cookies require options
    const options = {
        httpOnly: true, // This makes the cookie inaccessible to JavaScript. so document.cookie cant read it
        secure: true // This tells the browser to only send the cookie over HTTPS. it will not work on http://
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )


});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true // return the latest updated data from db, in our case we not storing user so its optional
        }
    );
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged Out"
            )
        )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current User Fetched"
        )
    )
})

const verifyEmail = asyncHandler(async(req, res) => {
    const {verificationToken} = req.params;

    if(!verificationToken) {
        throw new ApiError(400, "Email Verification token is missing")
    }

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })

    if(!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200,
            user.isEmailVerified,
            "Email is Verified"
        )
    )
})

const resendEmailVerification = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id);

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    if(user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user.email,
        subject: "Resending Verfication Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Mail has been send to your email id"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id)

        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                200,
                {
                    accessToken, refreshToken
                },
                "Access Token Generated Successfully"
            ))
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})



const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user) {
        throw new ApiError(400, "Invalid Email Id", [])
    }

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user.email,
        subject: "Reset Your Account Password",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/forget-password/${unHashedToken}`
        )
    })

    return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Password Reset Mail Sent Successfully"
                )
            )
})


const resetForgotPassword = asyncHandler(async(req, res) => {
    const {resetToken} = req.params;
    const {newPassword} = req.body;

    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password Reset Successfully"
        )
    )
})


const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user._id);

    if(!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password Changed Successfully"
        )
    )
})


export {registerUser, login, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, forgotPassword, resetForgotPassword, changeCurrentPassword}