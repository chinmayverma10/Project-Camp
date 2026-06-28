import { Router } from "express"
import { registerUser } from "../controllers/auth.controllers.js"
import { registerUserValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middleware.js";
import { loginUser } from "../controllers/auth.controllers.js";
import { loginUserValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { logoutUser } from "../controllers/auth.controllers.js";
import { getCurrentUser, verifyEmail, resendEmailVerification, refreshToken } from "../controllers/auth.controllers.js";

const router = Router();

router.route("/register").post(registerUserValidator(),validate,registerUser);
router.route("/login").post(loginUserValidator(),validate,loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/verify-email/:verificationToken").get(verifyJWT, verifyEmail);
router.route("resend-email-verification").post(verifyJWT, resendEmailVerification);
router.route("refresh-token").post(verifyJWT, refreshToken);



export default router;