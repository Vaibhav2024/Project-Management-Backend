import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()


//basic configuration
app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))    // express.urlencoded() converts this raw string into a readable JavaScript object. 
app.use(express.static("public"))
app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173"], 
    // we are using array now cause if there are multiple route from where you need to access the backend you need array
    credentials: true, //Allows cookies, authorization headers, and sessions to be sent across origins.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], //These are the HTTP methods your backend allows from browsers.
    allowedHeaders: ["Content-Type", "Authorization"] 
    // These request headers are allowed from the frontend”
    // Common ones:  Content-Type → for JSON,  Authorization → for Bearer tokens / JWT
}))

import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import projectRouter from './routes/project.routes.js'

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app/use("api/v1/projects", projectRouter)

//Error handler middlweare should always be written at last
app.use(errorHandler)

export default app;