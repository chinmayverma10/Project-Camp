import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Note } from "../models/note.models.js";

const getNotes = asyncHandler(async(req,res)=> {
    const notes = await Note.find({project: req.params.projectId})
        .populate("createdBy","username email fullName")
        .sort({createdAt: -1});

    res.status(200).json(new ApiResponse(200,notes,"Notes fetched successfully"))
})

const createNote = asyncHandler(async(req,res)=> {
    const note = await Note.create({
        content: req.body.content,
        project: req.params.projectId,
        createdBy: req.user._id
    })

    res.status(201).json(new ApiResponse(201,note,"Note created successfully"))
})

const getNoteById = asyncHandler(async(req,res)=> {
    const note = await Note.findOne({_id: req.params.noteId,project: req.params.projectId})
        .populate("createdBy","username email fullName");

    if(!note){
        throw new ApiError(404,"Note not found")
    }

    res.status(200).json(new ApiResponse(200,note,"Note fetched successfully"))
})

const updateNote = asyncHandler(async(req,res)=> {
    const note = await Note.findOneAndUpdate(
        {_id: req.params.noteId,project: req.params.projectId},
        {content: req.body.content},
        {returnDocument: "after",runValidators: true}
    )

    if(!note){
        throw new ApiError(404,"Note not found")
    }

    res.status(200).json(new ApiResponse(200,note,"Note updated successfully"))
})

const deleteNote = asyncHandler(async(req,res)=> {
    const note = await Note.findOneAndDelete({_id: req.params.noteId,project: req.params.projectId});
    if(!note){
        throw new ApiError(404,"Note not found")
    }

    res.status(200).json(new ApiResponse(200,note,"Note deleted successfully"))
})

export {getNotes,createNote,getNoteById,updateNote,deleteNote};
