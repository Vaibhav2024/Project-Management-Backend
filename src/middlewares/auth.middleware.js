import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // smartphone devices do not have access to cookies so we have another concept for smartphone that is sending accessToken in Header, there is a fixed syntax for sending cookie in header of smartphone that is key="Authorization" and value Bearer access_token. as we are also writing Bearer in header we use replace to remove it so that we only get accessToken

    if(!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decoded token is a object which has the same info that we provided while creating access token that is, _id, email, username

        const user = await User.findById(decoded_token?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        )

        if(!user) {
            throw new ApiError(401, "Invalid access token")
        }

        req.user = user; //every middleware takes its data to next middleware or function is we provide data in its previous middleware
        next();
        
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }
})