    import { validationResult } from "express-validator";
    import { ApiError } from "../utils/api-error.js";

    export const validate = (req,res,next) =>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            return next();
        }
    console.log(errors.array());
        const validationError = [];
        errors.array().map((err)=> validationError.push({
            [err.path] : err.msg,
        }))




        throw new ApiError(422, "Data Validation failed" , validationError);
    }