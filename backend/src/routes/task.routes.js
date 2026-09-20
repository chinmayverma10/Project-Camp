import { Router } from "express";
import { getTasks, createTask, getTaskById, updateTask, deleteTask, createSubTask, updateSubTask, deleteSubTask } from "../controllers/tasks.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyProjectMember, verifyProjectAdminOrAdmin } from "../middlewares/project.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { projectIdValidator, taskValidator, updateTaskValidator, subTaskValidator, updateSubTaskValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/:projectId").get(verifyJWT,projectIdValidator(),validate,verifyProjectMember,getTasks)
router.route("/:projectId").post(verifyJWT,upload.array("attachments",5),projectIdValidator(),taskValidator(),validate,verifyProjectAdminOrAdmin,createTask)
router.route("/:projectId/t/:taskId").get(verifyJWT,projectIdValidator(),updateTaskValidator(),validate,verifyProjectMember,getTaskById)
router.route("/:projectId/t/:taskId").put(verifyJWT,upload.array("attachments",5),projectIdValidator(),updateTaskValidator(),validate,verifyProjectAdminOrAdmin,updateTask)
router.route("/:projectId/t/:taskId").delete(verifyJWT,projectIdValidator(),updateTaskValidator(),validate,verifyProjectAdminOrAdmin,deleteTask)
router.route("/:projectId/t/:taskId/subtasks").post(verifyJWT,projectIdValidator(),updateTaskValidator(),subTaskValidator(),validate,verifyProjectAdminOrAdmin,createSubTask)
router.route("/:projectId/st/:subTaskId").put(verifyJWT,projectIdValidator(),updateSubTaskValidator(),validate,verifyProjectMember,updateSubTask)
router.route("/:projectId/st/:subTaskId").delete(verifyJWT,projectIdValidator(),updateSubTaskValidator(),validate,verifyProjectAdminOrAdmin,deleteSubTask)

export default router;
