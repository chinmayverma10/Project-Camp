import dotenv from "dotenv";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({path: ".env"});

const {default: app} = await import("../src/app.js");
const {User} = await import("../src/models/user.models.js");
const {Project} = await import("../src/models/project.models.js");
const {ProjectMember} = await import("../src/models/projectmember.models.js");
const {Task} = await import("../src/models/task.models.js");
const {SubTask} = await import("../src/models/subtask.models.js");
const {Note} = await import("../src/models/note.models.js");

const testId = `integration-${Date.now()}`;
const testEmailDomain = `${testId}.example.test`;
let server;
let baseUrl;
let projectId;
let taskId;
let subTaskId;
let noteId;
let uploadedFiles = [];
let isDatabaseConnected = false;

const request = async(pathname,options = {}) => {
    const response = await fetch(`${baseUrl}${pathname}`,options);
    const body = await response.json();
    return {response,body};
}

const authHeader = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`
})

const registerAndLogin = async(username) => {
    const email = `${username}@${testEmailDomain}`;
    const password = "Testing@123";
    const register = await request("/api/v1/auth/register",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username,email,password,fullName: username})
    });
    assert.equal(register.response.status,201);

    const login = await request("/api/v1/auth/login",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email,password})
    });
    assert.equal(login.response.status,200);

    return {email,password,user: register.body.data.user,accessToken: login.body.data.accessToken,refreshToken: login.body.data.refreshToken};
}

const cleanup = async() => {
    if(!isDatabaseConnected){
        return;
    }

    const testUsers = await User.find({email: {$regex: testEmailDomain}}).select("_id");
    const userIds = testUsers.map((user) => user._id);
    const projects = await Project.find({name: {$regex: testId}}).select("_id");
    const projectIds = projects.map((project) => project._id);
    const tasks = await Task.find({project: {$in: projectIds}}).select("_id attachment");

    for(const task of tasks){
        for(const attachment of task.attachment){
            const filePath = path.resolve("public",attachment.url.replace(/^\//,""));
            await fs.unlink(filePath).catch(() => {})
        }
    }

    await SubTask.deleteMany({task: {$in: tasks.map((task) => task._id)}});
    await Task.deleteMany({project: {$in: projectIds}});
    await Note.deleteMany({project: {$in: projectIds}});
    await ProjectMember.deleteMany({$or: [{project: {$in: projectIds}},{user: {$in: userIds}}]});
    await Project.deleteMany({_id: {$in: projectIds}});
    await User.deleteMany({_id: {$in: userIds}});
}

try {
    await mongoose.connect(process.env.MONGO_URI);
    isDatabaseConnected = true;
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening",resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    const healthcheck = await request("/api/v1/healthcheck/");
    assert.equal(healthcheck.response.status,200);

    const admin = await registerAndLogin(`admin${Date.now()}`);
    const member = await registerAndLogin(`member${Date.now()}`);
    const projectAdmin = await registerAndLogin(`projectadmin${Date.now()}`);

    await User.findByIdAndUpdate(admin.user._id,{$set: {role: "admin"}});
    const adminLogin = await request("/api/v1/auth/login",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: admin.email,password: admin.password})
    });
    assert.equal(adminLogin.response.status,200);
    const adminAccessToken = adminLogin.body.data.accessToken;

    const currentUser = await request("/api/v1/auth/current-user",{headers: authHeader(adminAccessToken)});
    assert.equal(currentUser.response.status,200);

    const refresh = await request("/api/v1/auth/refresh-token",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken: adminLogin.body.data.refreshToken})
    });
    assert.equal(refresh.response.status,200);

    const project = await request("/api/v1/projects/",{
        method: "POST",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({name: testId,description: "Integration test project"})
    });
    assert.equal(project.response.status,201);
    projectId = project.body.data.createdProject._id;

    const projects = await request("/api/v1/projects/",{headers: authHeader(adminAccessToken)});
    assert.equal(projects.response.status,200);
    assert.equal(projects.body.data.length,1);

    const projectDetails = await request(`/api/v1/projects/${projectId}`,{headers: authHeader(adminAccessToken)});
    assert.equal(projectDetails.response.status,200);

    const updatedProject = await request(`/api/v1/projects/${projectId}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({name: testId,description: "Updated integration test project"})
    });
    assert.equal(updatedProject.response.status,200);

    const addMember = await request(`/api/v1/projects/${projectId}/members`,{
        method: "POST",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({email: member.email})
    });
    assert.equal(addMember.response.status,201);

    const addProjectAdmin = await request(`/api/v1/projects/${projectId}/members`,{
        method: "POST",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({email: projectAdmin.email,role: "project_admin"})
    });
    assert.equal(addProjectAdmin.response.status,201);

    const members = await request(`/api/v1/projects/${projectId}/members`,{headers: authHeader(adminAccessToken)});
    assert.equal(members.response.status,200);
    assert.equal(members.body.data.length,3);

    const demoteProjectAdmin = await request(`/api/v1/projects/${projectId}/members/${projectAdmin.user._id}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({role: "member"})
    });
    assert.equal(demoteProjectAdmin.response.status,200);

    const promoteProjectAdmin = await request(`/api/v1/projects/${projectId}/members/${projectAdmin.user._id}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({role: "project_admin"})
    });
    assert.equal(promoteProjectAdmin.response.status,200);

    const uploadData = new FormData();
    uploadData.append("title","Integration test task");
    uploadData.append("description","Task with an attachment");
    uploadData.append("assignedTo",member.user._id);
    uploadData.append("status","todo");
    uploadData.append("attachments",new Blob(["test attachment"],{type: "application/pdf"}),"test.pdf");
    const task = await request(`/api/v1/tasks/${projectId}`,{
        method: "POST",
        headers: authHeader(adminAccessToken),
        body: uploadData
    });
    assert.equal(task.response.status,201);
    assert.equal(task.body.data.attachment.length,1);
    taskId = task.body.data._id;

    const tasks = await request(`/api/v1/tasks/${projectId}`,{headers: authHeader(adminAccessToken)});
    assert.equal(tasks.response.status,200);
    assert.equal(tasks.body.data.length,1);

    const subTask = await request(`/api/v1/tasks/${projectId}/t/${taskId}/subtasks`,{
        method: "POST",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({title: "Integration test subtask"})
    });
    assert.equal(subTask.response.status,201);
    subTaskId = subTask.body.data._id;

    const taskDetails = await request(`/api/v1/tasks/${projectId}/t/${taskId}`,{headers: authHeader(adminAccessToken)});
    assert.equal(taskDetails.response.status,200);
    assert.equal(taskDetails.body.data.subtasks.length,1);

    const completeSubTask = await request(`/api/v1/tasks/${projectId}/st/${subTaskId}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(member.accessToken)},
        body: JSON.stringify({isCompleted: true})
    });
    assert.equal(completeSubTask.response.status,200);
    assert.equal(completeSubTask.body.data.isCompleted,true);

    const updateTask = await request(`/api/v1/tasks/${projectId}/t/${taskId}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(projectAdmin.accessToken)},
        body: JSON.stringify({status: "in_progress"})
    });
    assert.equal(updateTask.response.status,200);
    assert.equal(updateTask.body.data.status,"in_progress");

    const note = await request(`/api/v1/notes/${projectId}`,{
        method: "POST",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({content: "Integration test note"})
    });
    assert.equal(note.response.status,201);
    noteId = note.body.data._id;

    const noteDetails = await request(`/api/v1/notes/${projectId}/n/${noteId}`,{headers: authHeader(member.accessToken)});
    assert.equal(noteDetails.response.status,200);

    const notes = await request(`/api/v1/notes/${projectId}`,{headers: authHeader(member.accessToken)});
    assert.equal(notes.response.status,200);
    assert.equal(notes.body.data.length,1);

    const updateNote = await request(`/api/v1/notes/${projectId}/n/${noteId}`,{
        method: "PUT",
        headers: {"Content-Type": "application/json",...authHeader(adminAccessToken)},
        body: JSON.stringify({content: "Updated integration test note"})
    });
    assert.equal(updateNote.response.status,200);

    const deleteNote = await request(`/api/v1/notes/${projectId}/n/${noteId}`,{
        method: "DELETE",
        headers: authHeader(adminAccessToken)
    });
    assert.equal(deleteNote.response.status,200);

    const deleteSubTask = await request(`/api/v1/tasks/${projectId}/st/${subTaskId}`,{
        method: "DELETE",
        headers: authHeader(projectAdmin.accessToken)
    });
    assert.equal(deleteSubTask.response.status,200);

    const deleteTask = await request(`/api/v1/tasks/${projectId}/t/${taskId}`,{
        method: "DELETE",
        headers: authHeader(projectAdmin.accessToken)
    });
    assert.equal(deleteTask.response.status,200);

    const removeMember = await request(`/api/v1/projects/${projectId}/members/${member.user._id}`,{
        method: "DELETE",
        headers: authHeader(adminAccessToken)
    });
    assert.equal(removeMember.response.status,200);

    const logout = await request("/api/v1/auth/logout",{
        method: "POST",
        headers: authHeader(member.accessToken)
    });
    assert.equal(logout.response.status,200);

    const deleteProject = await request(`/api/v1/projects/${projectId}`,{
        method: "DELETE",
        headers: authHeader(adminAccessToken)
    });
    assert.equal(deleteProject.response.status,200);

    console.log("Integration test passed");
} finally {
    await cleanup().catch((error) => console.error("Cleanup failed",error));
    if(server){
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect().catch(() => {});
}
