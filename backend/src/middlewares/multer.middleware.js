import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/api-error.js";

const uploadDirectory = path.resolve("public/images/tasks");
fs.mkdirSync(uploadDirectory,{recursive: true});

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,uploadDirectory)
    },
    filename: function(req,file,cb){
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null,`${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

const fileFilter = (req,file,cb) => {
    if(file.mimetype.startsWith("image/") || file.mimetype === "application/pdf"){
        cb(null,true)
    } else {
        cb(new ApiError(400,"Only image and PDF attachments are allowed"),false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    }
})

export {upload};
