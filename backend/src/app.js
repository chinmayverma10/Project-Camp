import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import healthCheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck",healthCheckRouter);

import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/auth",authRouter);   

import projectRouter from "./routes/project.routes.js";
app.use("/api/v1/projects",projectRouter);

import taskRouter from "./routes/task.routes.js";
app.use("/api/v1/tasks",taskRouter);

import noteRouter from "./routes/note.routes.js";
app.use("/api/v1/notes",noteRouter);

app.get("/",(req,res)=>{
    res.send("Hello World!!")
})

app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        statusCode,
        data: null,
        message: err.message || "Internal server error",
        success: false,
        errors: err.errors || []
    })
})


export default app;
