import { Router } from "express"
import { registerUser } from "../controllers/auth.controllers.js"
import { registerUserValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middleware.js";
import { loginUser } from "../controllers/auth.controllers.js";
import { loginUserValidator } from "../validators/index.js";

const router = Router();

router.route("/register").post(registerUserValidator(),validate,registerUser);
router.route("/login").post(loginUserValidator(),validate,loginUser);


export default router;