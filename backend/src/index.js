import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env",
});

connectDB()
 .then(()=>{
    app.listen(PORT,()=>{
    console.log(`app is listening on http://localhost:${PORT}`)
    })
 })
 .catch((err) =>{
    console.error("DB connection failed", err);
    process.exit(1);
 })

const PORT = process.env.PORT || 3000;





