import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

const getProjectMember = async(req) => {
    const { projectId } = req.params;

    const projectMember = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id
    })

    return projectMember;
}

const verifyProjectMember = asyncHandler(async(req,res,next) => {
    const projectMember = await getProjectMember(req);

    if(!projectMember){
        throw new ApiError(403,"You do not have access to this project")
    }

    req.projectMember = projectMember;
    next();
})

const verifyProjectAdmin = asyncHandler(async(req,res,next) => {
    const projectMember = await getProjectMember(req);

    if(!projectMember || projectMember.role !== UserRolesEnum.ADMIN){
        throw new ApiError(403,"Only project admins can perform this action")
    }

    req.projectMember = projectMember;
    next();
})

const verifyProjectAdminOrAdmin = asyncHandler(async(req,res,next) => {
    const projectMember = await getProjectMember(req);

    if(!projectMember || ![UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN].includes(projectMember.role)){
        throw new ApiError(403,"You do not have permission to perform this action")
    }

    req.projectMember = projectMember;
    next();
})

const verifyAdmin = asyncHandler(async(req,res,next) => {
    if(req.user.role !== UserRolesEnum.ADMIN){
        throw new ApiError(403,"Only admins can perform this action")
    }

    next();
})

export {verifyProjectMember, verifyProjectAdmin, verifyProjectAdminOrAdmin, verifyAdmin};
