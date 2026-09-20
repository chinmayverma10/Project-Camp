import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/user.models.js";
import { Project } from "../src/models/project.models.js";
import { ProjectMember } from "../src/models/projectmember.models.js";
import { Task } from "../src/models/task.models.js";
import { SubTask } from "../src/models/subtask.models.js";
import { Note } from "../src/models/note.models.js";
import { UserRolesEnum, TaskStatusEnum } from "../src/utils/constants.js";

dotenv.config({path: ".env"});

const demoPassword = "Demo@12345";
const demoUsers = [
    {username: "oliviaadmin",fullName: "Olivia Bennett",email: "olivia.bennett@projectcamp.demo",role: UserRolesEnum.ADMIN},
    {username: "marcuslee",fullName: "Marcus Lee",email: "marcus.lee@projectcamp.demo"},
    {username: "priyanayar",fullName: "Priya Nayar",email: "priya.nayar@projectcamp.demo"},
    {username: "danielcho",fullName: "Daniel Cho",email: "daniel.cho@projectcamp.demo"},
    {username: "sofiamartin",fullName: "Sofia Martin",email: "sofia.martin@projectcamp.demo"},
    {username: "ethanreyes",fullName: "Ethan Reyes",email: "ethan.reyes@projectcamp.demo"},
    {username: "aishagreen",fullName: "Aisha Green",email: "aisha.green@projectcamp.demo"},
    {username: "liamclarke",fullName: "Liam Clarke",email: "liam.clarke@projectcamp.demo"},
    {username: "noraross",fullName: "Nora Ross",email: "nora.ross@projectcamp.demo"},
    {username: "jakobellis",fullName: "Jake Ellis",email: "jake.ellis@projectcamp.demo"},
    {username: "mayawilson",fullName: "Maya Wilson",email: "maya.wilson@projectcamp.demo"},
    {username: "leolambert",fullName: "Leo Lambert",email: "leo.lambert@projectcamp.demo"},
    {username: "rachelking",fullName: "Rachel King",email: "rachel.king@projectcamp.demo"},
    {username: "harperstone",fullName: "Harper Stone",email: "harper.stone@projectcamp.demo"},
    {username: "owenbrooks",fullName: "Owen Brooks",email: "owen.brooks@projectcamp.demo"}
];

const projectTemplates = [
    {name: "Website Redesign",description: "A focused refresh of the customer marketing site.",tasks: ["Finalize information architecture","Review homepage wireframes","Build responsive pricing section","Prepare launch checklist","Run accessibility review","Publish production release"]},
    {name: "Mobile App v2",description: "The next release of the customer mobile experience.",tasks: ["Map onboarding journey","Implement push notification settings","Design offline state","Build account preferences","Run beta feedback session","Prepare App Store assets"]},
    {name: "Q4 Growth Campaign",description: "Cross-channel campaign planning for the final quarter.",tasks: ["Define audience segments","Draft campaign landing page","Create email nurture sequence","Review paid social concepts","Set attribution dashboard","Present campaign retrospective"]},
    {name: "Customer Portal",description: "A secure self-service space for enterprise customers.",tasks: ["Document portal permissions","Create account overview screen","Build invoice download flow","Connect support ticket history","Test account invitation flow","Plan customer pilot"]},
    {name: "Operations Playbook",description: "Practical systems and documentation for a growing team.",tasks: ["Audit recurring team rituals","Write incident response guide","Create vendor review template","Document hiring workflow","Review access management","Publish team handbook"]}
];

const taskDescriptions = [
    "Gather the relevant context, align with stakeholders, and document the agreed next steps.",
    "Create a clear first version, share it for review, and incorporate the practical feedback.",
    "Confirm edge cases and leave the work in a state that another teammate can continue.",
    "Coordinate the final review and capture any decisions in the project notes."
];

const cleanDemoData = async() => {
    const users = await User.find({email: /@projectcamp\.demo$/}).select("_id");
    const userIds = users.map((user) => user._id);
    const projects = await Project.find({createdBy: {$in: userIds}}).select("_id");
    const projectIds = projects.map((project) => project._id);
    const tasks = await Task.find({project: {$in: projectIds}}).select("_id");

    await SubTask.deleteMany({task: {$in: tasks.map((task) => task._id)}});
    await Task.deleteMany({project: {$in: projectIds}});
    await Note.deleteMany({project: {$in: projectIds}});
    await ProjectMember.deleteMany({$or: [{project: {$in: projectIds}},{user: {$in: userIds}}]});
    await Project.deleteMany({_id: {$in: projectIds}});
    await User.deleteMany({_id: {$in: userIds}});
}

try {
    await mongoose.connect(process.env.MONGO_URI);
    await cleanDemoData();

    const users = await User.create(demoUsers.map((user) => ({...user,password: demoPassword})));
    const admin = users[0];
    const projectAdmins = users.slice(1,5);
    const members = users.slice(5);

    let projectCount = 0;
    let membershipCount = 0;
    let taskCount = 0;
    let subTaskCount = 0;
    let noteCount = 0;

    for(let projectIndex = 0;projectIndex < projectTemplates.length;projectIndex++){
        const template = projectTemplates[projectIndex];
        const project = await Project.create({
            name: template.name,
            description: template.description,
            createdBy: admin._id
        });
        projectCount++;

        const adminsForProject = [
            projectAdmins[projectIndex % projectAdmins.length],
            projectAdmins[(projectIndex + 1) % projectAdmins.length]
        ];
        const membersForProject = members.slice(projectIndex,projectIndex + 6).concat(members.slice(0,Math.max(0,projectIndex + 6 - members.length)));
        const projectMembers = [
            {user: admin._id,project: project._id,role: UserRolesEnum.ADMIN},
            ...adminsForProject.map((user) => ({user: user._id,project: project._id,role: UserRolesEnum.PROJECT_ADMIN})),
            ...membersForProject.map((user) => ({user: user._id,project: project._id,role: UserRolesEnum.MEMBER}))
        ];
        await ProjectMember.insertMany(projectMembers);
        membershipCount += projectMembers.length;

        for(let taskIndex = 0;taskIndex < template.tasks.length;taskIndex++){
            const task = await Task.create({
                title: template.tasks[taskIndex],
                description: taskDescriptions[taskIndex % taskDescriptions.length],
                project: project._id,
                assignedBy: adminsForProject[taskIndex % adminsForProject.length]._id,
                assignedTo: membersForProject[taskIndex % membersForProject.length]._id,
                status: [TaskStatusEnum.TODO,TaskStatusEnum.IN_PROGRESS,TaskStatusEnum.DONE][taskIndex % 3]
            });
            taskCount++;

            const subTasks = await SubTask.create([
                {title: `Prepare ${task.title.toLowerCase()} inputs`,task: task._id,createdBy: task.assignedBy,isCompleted: taskIndex % 3 === 2},
                {title: `Review ${task.title.toLowerCase()} outcome`,task: task._id,createdBy: task.assignedBy,isCompleted: false}
            ]);
            subTaskCount += subTasks.length;
        }

        const notes = await Note.create([
            {project: project._id,createdBy: admin._id,content: "Weekly focus: keep decisions documented and flag blockers early."},
            {project: project._id,createdBy: adminsForProject[0]._id,content: "The next project review is scheduled for Thursday. Please update task status before the meeting."},
            {project: project._id,createdBy: adminsForProject[1]._id,content: "Customer feedback and useful links should be collected here for the whole team."}
        ]);
        noteCount += notes.length;
    }

    console.log(`Seeded ${users.length} users, ${projectCount} projects, ${membershipCount} memberships, ${taskCount} tasks, ${subTaskCount} subtasks, and ${noteCount} notes.`);
    console.log("Demo admin login: olivia.bennett@projectcamp.demo / Demo@12345");
} finally {
    await mongoose.disconnect().catch(() => {});
}
