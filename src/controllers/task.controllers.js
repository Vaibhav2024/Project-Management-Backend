import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";

const getTasks = asyncHandler(async(req, res) => {
    // test
});

const getTaskById = asyncHandler(async(req, res) => {
    // test
});

const createTask = asyncHandler(async(req, res) => {
    // test
});

const updateTask = asyncHandler(async(req, res) => {
    // test
});

const deleteTask = asyncHandler(async(req, res) => {
    // test
});

const createSubTask = asyncHandler(async(req, res) => {
    // test
});

const updateSubTask = asyncHandler(async(req, res) => {
    // test
});

const deleteSubTask = asyncHandler(async(req, res) => {
    // test
});

export {getTasks, getTaskById, createTask, updateTask, deleteTask, createSubTask, updateSubTask, deleteSubTask}