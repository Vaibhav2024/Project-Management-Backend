import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const getProjects = asyncHandler(async(req, res) => {
    //test
})

const getProjectById = asyncHandler(async(req, res) => {
    //test
})

const createProject = asyncHandler(async(req, res) => {
    //test
})

const updateProject = asyncHandler(async(req, res) => {
    //test
})

const deleteProject = asyncHandler(async(req, res) => {
    //test
})

const addMembersToProject = asyncHandler(async(req, res) => {
    //test
})

const getProjectMembers = asyncHandler(async(req, res) => {
    //test
})

const updateMemberRole = asyncHandler(async(req, res) => {
    //test
})

const deleteMember = asyncHandler(async(req, res) => {
    //test
})

export {getProjects, getProjectById, createProject, updateProject, deleteProject, addMembersToProject, getProjectMembers, updateMemberRole, deleteMember}
