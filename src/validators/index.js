import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is Invalid"),

        body("username").trim().notEmpty().withMessage("Username is required").isLowercase("Username must be in lower case").isLength({min: 3}).withMessage("Username must be atleast 3 characters long"),

        body("password").trim().notEmpty().withMessage("Password field cannot be empty").isLength({min: 8}).withMessage("password must contain be of 8 letters").matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter and one special character"),

        body("fullName").optional().trim().notEmpty()
    ]
}

const userLoginValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is Invalid"),
        body("password").trim().notEmpty().withMessage("Enter your password")
    ]
}

export {userRegisterValidator, userLoginValidator}