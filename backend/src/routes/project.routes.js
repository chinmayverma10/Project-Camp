import { Router } from "express"
import { createProject, updateProject, deleteProject, getProjectDetails,getProjectById, addProjectMember, getProjectMembers, updateMemberRole, removeMember } from "../controllers/projects.controllers.js"
import { verifyJWT} from "../middlewares/auth.middleware.js"
import { verifyAdmin, verifyProjectAdmin, verifyProjectMember } from "../middlewares/project.middleware.js";
import { projectIdValidator, projectValidator, memberValidator, memberRoleValidator, userIdValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";


const router = Router();

router.route("/").post(verifyJWT,verifyAdmin,projectValidator(),validate,createProject)
router.route("/").get(verifyJWT,getProjectDetails)
router.route("/:projectId").get(verifyJWT,projectIdValidator(),validate,verifyProjectMember,getProjectById)
router.route("/:projectId").put(verifyJWT,projectIdValidator(),projectValidator(),validate,verifyProjectAdmin,updateProject)
router.route("/:projectId").delete(verifyJWT,projectIdValidator(),validate,verifyProjectAdmin,deleteProject)
router.route("/:projectId/members").post(verifyJWT,projectIdValidator(),memberValidator(),validate,verifyProjectAdmin,addProjectMember)
router.route("/:projectId/members").get(verifyJWT,projectIdValidator(),validate,verifyProjectMember,getProjectMembers)
router.route("/:projectId/members/:userId").put(verifyJWT,projectIdValidator(),memberRoleValidator(),validate,verifyProjectAdmin,updateMemberRole)
router.route("/:projectId/members/:userId").delete(verifyJWT,projectIdValidator(),userIdValidator(),validate,verifyProjectAdmin,removeMember)

export default router;
