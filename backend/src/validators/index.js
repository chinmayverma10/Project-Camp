import { body,param } from "express-validator";
import { AvailableTaskStatus, AvailableUserRoles } from "../utils/constants.js";

const registerUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 8 })
      .withMessage("Username should be atleast 8 Character"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 Character")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).+$/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
  ];
};


const loginUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 Character")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).+$/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
  ];
};

const projectIdValidator = () => [
  param("projectId").isMongoId().withMessage("Project id is invalid"),
];

const projectValidator = () => [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().trim(),
];

const memberValidator = () => [
  body("email").trim().isEmail().withMessage("Valid member email is required"),
  body("role").optional().isIn(AvailableUserRoles).withMessage("Invalid user role"),
];

const memberRoleValidator = () => [
  param("userId").isMongoId().withMessage("User id is invalid"),
  body("role").isIn(AvailableUserRoles).withMessage("Invalid user role"),
];

const userIdValidator = () => [
  param("userId").isMongoId().withMessage("User id is invalid"),
];

const taskValidator = () => [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("description").optional().trim(),
  body("assignedTo").isMongoId().withMessage("Task assignee is invalid"),
  body("status").optional().isIn(AvailableTaskStatus).withMessage("Invalid task status"),
];

const updateTaskValidator = () => [
  param("taskId").isMongoId().withMessage("Task id is invalid"),
  body("title").optional().trim().notEmpty().withMessage("Task title cannot be empty"),
  body("assignedTo").optional().isMongoId().withMessage("Task assignee is invalid"),
  body("status").optional().isIn(AvailableTaskStatus).withMessage("Invalid task status"),
];

const subTaskValidator = () => [
  body("title").trim().notEmpty().withMessage("Subtask title is required"),
];

const updateSubTaskValidator = () => [
  param("subTaskId").isMongoId().withMessage("Subtask id is invalid"),
  body("title").optional().trim().notEmpty().withMessage("Subtask title cannot be empty"),
  body("isCompleted").optional().isBoolean().withMessage("Subtask completion status must be a boolean"),
];

const noteValidator = () => [
  body("content").trim().notEmpty().withMessage("Note content is required"),
];

const noteIdValidator = () => [
  param("noteId").isMongoId().withMessage("Note id is invalid"),
];

export {
    registerUserValidator,
    loginUserValidator,
    projectIdValidator,
    projectValidator,
    memberValidator,
    memberRoleValidator,
    userIdValidator,
    taskValidator,
    updateTaskValidator,
    subTaskValidator,
    updateSubTaskValidator,
    noteValidator,
    noteIdValidator
}
