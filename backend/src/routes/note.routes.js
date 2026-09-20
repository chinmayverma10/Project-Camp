import { Router } from "express";
import { getNotes, createNote, getNoteById, updateNote, deleteNote } from "../controllers/notes.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyProjectMember, verifyProjectAdmin } from "../middlewares/project.middleware.js";
import { projectIdValidator, noteValidator, noteIdValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/:projectId").get(verifyJWT,projectIdValidator(),validate,verifyProjectMember,getNotes)
router.route("/:projectId").post(verifyJWT,projectIdValidator(),noteValidator(),validate,verifyProjectAdmin,createNote)
router.route("/:projectId/n/:noteId").get(verifyJWT,projectIdValidator(),noteIdValidator(),validate,verifyProjectMember,getNoteById)
router.route("/:projectId/n/:noteId").put(verifyJWT,projectIdValidator(),noteIdValidator(),noteValidator(),validate,verifyProjectAdmin,updateNote)
router.route("/:projectId/n/:noteId").delete(verifyJWT,projectIdValidator(),noteIdValidator(),validate,verifyProjectAdmin,deleteNote)

export default router;
