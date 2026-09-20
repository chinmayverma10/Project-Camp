import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Note } from "../models/note.models.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import fs from "fs/promises";
import path from "path";

const getProjectById = asyncHandler(async(req,res)=> {
    const project = await Project.findById(req.params.projectId);

    if(!project){
        throw new ApiError(404,"Project not found")
    }

    res.status(200).json(new ApiResponse(200,project,"Project fetched successfully"))
})

const createProject = asyncHandler(async(req,res)=> {
    const {name,description} = req.body;
    const createdProject = await Project.create({name,description,createdBy: req.user._id});

    await ProjectMember.create({
        user: req.user._id,
        project: createdProject._id,
        role: UserRolesEnum.ADMIN
    })

    res.status(201).json(new ApiResponse(201,{createdProject},"Project Created Successfully"))
})

const getProjectDetails = asyncHandler(async(req,res)=> {
    const projects = await ProjectMember.find({user: req.user._id})
        .populate("project","name description createdBy createdAt updatedAt")
        .lean();

    const projectDetails = await Promise.all(projects.map(async(projectMember) => {
        const members = await ProjectMember.countDocuments({project: projectMember.project._id});
        return {project: {...projectMember.project,members},role: projectMember.role}
    }))

    res.status(200).json(new ApiResponse(200,projectDetails,"Projects fetched successfully"))
})

const updateProject = asyncHandler(async(req,res)=> {
    const {name,description} = req.body;
    const updatedProject = await Project.findByIdAndUpdate(req.params.projectId,{name,description},{returnDocument: "after",runValidators: true});

    if(!updatedProject){
        throw new ApiError(404,"Project does not exist")
    }

    res.status(200).json(new ApiResponse(200,updatedProject,"Project Updated Successfully"))
})

const deleteProject = asyncHandler(async(req,res)=> {
    const {projectId} = req.params;
    const tasks = await Task.find({project: projectId}).select("_id attachment");
    const taskIds = tasks.map((task) => task._id);

    for(const task of tasks){
        for(const attachment of task.attachment){
            const filePath = path.resolve("public",attachment.url.replace(/^\//,""));
            await fs.unlink(filePath).catch(() => {})
        }
    }

    await SubTask.deleteMany({task: {$in: taskIds}});
    await Task.deleteMany({project: projectId});
    await Note.deleteMany({project: projectId});
    await ProjectMember.deleteMany({project: projectId});
    const project = await Project.findByIdAndDelete(projectId);

    if(!project){
        throw new ApiError(404,"Project does not exist")
    }

    res.status(200).json(new ApiResponse(200,project,"Project deleted Successfully"))
})

const addProjectMember = asyncHandler(async(req,res)=> {
    const {email,role = UserRolesEnum.MEMBER} = req.body;

    if(!AvailableUserRoles.includes(role)){
        throw new ApiError(400,"Invalid user role")
    }

    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const projectMember = await ProjectMember.findOneAndUpdate(
        {user: user._id,project: req.params.projectId},
        {$set: {role}},
        {returnDocument: "after",upsert: true,setDefaultsOnInsert: true}
    )

    res.status(201).json(new ApiResponse(201,projectMember,"Member added successfully"))
})

const getProjectMembers = asyncHandler(async(req,res) => {
    const projectMembers = await ProjectMember.find({project: req.params.projectId})
        .populate("user","username email fullName avatar role")
        .select("project user role createdAt updatedAt");

    res.status(200).json(new ApiResponse(200,projectMembers,"Project members fetched successfully"))
})

const updateMemberRole = asyncHandler(async(req,res)=> {
    const {projectId,userId} = req.params;
    const {role} = req.body;

    if(!AvailableUserRoles.includes(role)){
        throw new ApiError(400,"Invalid user role")
    }

    const projectMember = await ProjectMember.findOne({project: projectId,user: userId});
    if(!projectMember){
        throw new ApiError(404,"Project member not found")
    }

    if(projectMember.role === UserRolesEnum.ADMIN && role !== UserRolesEnum.ADMIN){
        const adminCount = await ProjectMember.countDocuments({project: projectId,role: UserRolesEnum.ADMIN});
        if(adminCount === 1){
            throw new ApiError(400,"A project must have at least one admin")
        }
    }

    projectMember.role = role;
    await projectMember.save();

    res.status(200).json(new ApiResponse(200,projectMember,"Member role updated successfully"))
})

const removeMember = asyncHandler(async(req,res)=> {
    const {projectId,userId} = req.params;
    const projectMember = await ProjectMember.findOne({project: projectId,user: userId});

    if(!projectMember){
        throw new ApiError(404,"Project member not found")
    }

    if(projectMember.role === UserRolesEnum.ADMIN){
        const adminCount = await ProjectMember.countDocuments({project: projectId,role: UserRolesEnum.ADMIN});
        if(adminCount === 1){
            throw new ApiError(400,"A project must have at least one admin")
        }
    }

    await ProjectMember.deleteOne({_id: projectMember._id});
    res.status(200).json(new ApiResponse(200,{},"Member removed successfully"))
})

export {getProjectById,createProject,getProjectDetails,updateProject,deleteProject,addProjectMember,getProjectMembers,updateMemberRole,removeMember};
