import { Router } from "express";
import { changeCurrentPassword, forgotPassword, refreshAccessToken, registerUser, resendEmailVerification, resetForgotPassword } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator, userForgotPasswordValidator, userChangeCurrentPasswordValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { login, logoutUser, getCurrentUser, verifyEmail } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// unsecure route
router.route("/register").post(userRegisterValidator(), validate, registerUser)
// userRegisterValidator() runs and collects error and then the express import { validationResult } from "express-validator"; has all the errors that it received from userRegisterValidator() we just map them in array and throw the Api error;
//body is a method from express-validator package, and it automatically sends errors to validationResult method even without using next

router.route("/login").post(userLoginValidator(), validate, login)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPassword)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword)

//secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification)


export default router;






