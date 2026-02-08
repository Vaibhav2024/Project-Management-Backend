import { ApiError } from "../utils/api-error.js"

const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    })
}

export { errorHandler }

// const errorHandler = (err, req, res, next) => {
//     const statusCode = err.statusCode || 500

//     res.status(statusCode).json({
//         success: false,
//         message: err.message || "Internal Server Error",
//         errors: err.errors || [],
//     })
// }

// export default errorHandler

