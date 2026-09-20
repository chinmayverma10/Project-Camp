import { Router } from "express"
import { registerUser } from "../controllers/auth.controllers.js"
import { registerUserValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middleware.js";
import { loginUser } from "../controllers/auth.controllers.js";
import { loginUserValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { logoutUser } from "../controllers/auth.controllers.js";
import { getCurrentUser, refreshToken } from "../controllers/auth.controllers.js";

const router = Router();

router.route("/register").post(registerUserValidator(),validate,registerUser);
router.route("/login").post(loginUserValidator(),validate,loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-token").post(refreshToken);



export default router;
