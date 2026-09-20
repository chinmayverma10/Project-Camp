import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import fs from "fs/promises";
import path from "path";

const getAttachments = (files) => {
    if(!files){
        return [];
    }

    return files.map((file) => ({
        url: `/images/tasks/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
    }))
}

const deleteAttachments = async(attachments) => {
    for(const attachment of attachments){
        const filePath = path.resolve("public",attachment.url.replace(/^\//,""));
        await fs.unlink(filePath).catch(() => {})
    }
}

const getTasks = asyncHandler(async(req,res)=> {
    const tasks = await Task.find({project: req.params.projectId})
        .populate("assignedBy","username email fullName")
        .populate("assignedTo","username email fullName")
        .sort({createdAt: -1});

    res.status(200).json(new ApiResponse(200,tasks,"Tasks fetched successfully"))
})

const createTask = asyncHandler(async(req,res)=> {
    const {title,description,assignedTo,status} = req.body;
    const assignee = await ProjectMember.findOne({project: req.params.projectId,user: assignedTo});

    if(!assignee){
        throw new ApiError(400,"Task assignee must be a project member")
    }

    const task = await Task.create({
        title,
        description,
        project: req.params.projectId,
        assignedBy: req.user._id,
        assignedTo,
        status,
        attachment: getAttachments(req.files)
    })

    res.status(201).json(new ApiResponse(201,task,"Task created successfully"))
})

const getTaskById = asyncHandler(async(req,res)=> {
    const task = await Task.findOne({_id: req.params.taskId,project: req.params.projectId})
        .populate("assignedBy","username email fullName")
        .populate("assignedTo","username email fullName");

    if(!task){
        throw new ApiError(404,"Task not found")
    }

    const subtasks = await SubTask.find({task: task._id}).populate("createdBy","username email fullName");
    res.status(200).json(new ApiResponse(200,{task,subtasks},"Task fetched successfully"))
})

const updateTask = asyncHandler(async(req,res)=> {
    const {title,description,assignedTo,status} = req.body;
    const task = await Task.findOne({_id: req.params.taskId,project: req.params.projectId});

    if(!task){
        throw new ApiError(404,"Task not found")
    }

    if(assignedTo){
        const assignee = await ProjectMember.findOne({project: req.params.projectId,user: assignedTo});
        if(!assignee){
            throw new ApiError(400,"Task assignee must be a project member")
        }
        task.assignedTo = assignedTo;
    }

    if(title !== undefined) task.title = title;
    if(description !== undefined) task.description = description;
    if(status !== undefined) task.status = status;
    const attachments = getAttachments(req.files);
    if(attachments.length) task.attachment.push(...attachments);
    await task.save();

    res.status(200).json(new ApiResponse(200,task,"Task updated successfully"))
})

const deleteTask = asyncHandler(async(req,res)=> {
    const task = await Task.findOneAndDelete({_id: req.params.taskId,project: req.params.projectId});

    if(!task){
        throw new ApiError(404,"Task not found")
    }

    await SubTask.deleteMany({task: task._id});
    await deleteAttachments(task.attachment);
    res.status(200).json(new ApiResponse(200,task,"Task deleted successfully"))
})

const createSubTask = asyncHandler(async(req,res)=> {
    const task = await Task.findOne({_id: req.params.taskId,project: req.params.projectId});
    if(!task){
        throw new ApiError(404,"Task not found")
    }

    const subTask = await SubTask.create({
        title: req.body.title,
        task: task._id,
        createdBy: req.user._id
    })

    res.status(201).json(new ApiResponse(201,subTask,"Subtask created successfully"))
})

const updateSubTask = asyncHandler(async(req,res)=> {
    const subTask = await SubTask.findById(req.params.subTaskId);
    if(!subTask){
        throw new ApiError(404,"Subtask not found")
    }

    const task = await Task.findOne({_id: subTask.task,project: req.params.projectId});
    if(!task){
        throw new ApiError(404,"Subtask not found")
    }

    if(req.body.title !== undefined && req.projectMember.role === "member"){
        throw new ApiError(403,"Members can only update subtask completion status")
    }
    if(req.body.title !== undefined){
        subTask.title = req.body.title;
    }
    if(req.body.isCompleted !== undefined){
        subTask.isCompleted = req.body.isCompleted;
    }
    await subTask.save();

    res.status(200).json(new ApiResponse(200,subTask,"Subtask updated successfully"))
})

const deleteSubTask = asyncHandler(async(req,res)=> {
    const subTask = await SubTask.findById(req.params.subTaskId);
    if(!subTask){
        throw new ApiError(404,"Subtask not found")
    }

    const task = await Task.findOne({_id: subTask.task,project: req.params.projectId});
    if(!task){
        throw new ApiError(404,"Subtask not found")
    }

    await SubTask.deleteOne({_id: subTask._id});

    res.status(200).json(new ApiResponse(200,subTask,"Subtask deleted successfully"))
})

export {getTasks,createTask,getTaskById,updateTask,deleteTask,createSubTask,updateSubTask,deleteSubTask};
