import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()) {
        return next()
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(
        {
            [err.path]: err.msg
        }
    ));

    throw new ApiError(422, "Received data is not valid", extractedErrors)
}


/**
 * HOW THIS VALIDATION WORKS
 *
 * 1. userRegisterValidator()
 *    Returns an array of express-validator middlewares.
 *    Each body("field") creates a validation chain for req.body.field.
 *
 *    Example:
 *    body("email")
 *      .trim()                     // removes leading/trailing spaces
 *      .notEmpty()                 // fails if empty
 *      .isEmail()                  // checks email format
 *
 *    Password validation:
 *    body("password")
 *      .isLength({ min: 8 })        // minimum 8 characters
 *      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
 *      // regex enforces:
 *      // (?=.*[A-Z])  -> at least one uppercase letter
 *      // (?=.*[!@#$%^&*]) -> at least one special character
 *
 *    NOTE:
 *    No error is sent immediately — express-validator
 *    only collects validation errors at this stage.
 *
 * ---------------------------------------------------
 *
 * 2. validate middleware
 *    Reads all validation results after the above validators run.
 *
 *    const errors = validationResult(req);
 *
 *    If no errors exist:
 *    errors.isEmpty() === true
 *    -> next() is called and controller executes.
 *
 *    If errors exist:
 *    They are formatted like:
 *    [
 *      { email: "Email is required" },
 *      { password: "Password must contain at least one uppercase letter and one special character" }
 *    ]
 *
 *    Then a custom ApiError is thrown with status 422
 *    (Unprocessable Entity), which is handled by the
 *    global error handler.
 *
 * ---------------------------------------------------
 *
 * FLOW:
 * Request → userRegisterValidator() → validate → controller
 * Controller runs ONLY if validation passes.
 */
