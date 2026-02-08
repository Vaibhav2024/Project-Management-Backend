import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js";
import { login, logoutUser, getCurrentUser, verifyEmail } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(userRegisterValidator(), validate, registerUser)
// userRegisterValidator() runs and collects error and then the express import { validationResult } from "express-validator"; has all the errors that it received from userRegisterValidator() we just map them in array and throw the Api error;
//body is a method from express-validator package, and it automatically sends errors to validationResult method even without using next

router.route("/login").post(userLoginValidator(), validate, login)

//secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)

export default router;






