import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

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

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is required"),
        body("newPassword").notEmpty().withMessage("New Password is required"),
    ]
};

const userForgotPasswordValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("Email field is required").isEmail().withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("Password is required")
    ]
}

const createProjectValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is Required"),
        body("description").optional()
    ]
}

const addMemberToProjectValidator = () => {
    return [
        body("email").notEmpty().withMessage("email is required").isEmail().withMessage("Email is invalid"),
        body("role").notEmpty().withMessage("Role is required").isIn(AvailableUserRole).withMessage("Role is invalid")
    ]
}

export {userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, createProjectValidator, addMemberToProjectValidator}