import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: { $size: "$projectmembers" },
                        },
                    },
                ],
            },
        },
        { $unwind: "$project" },
        {
            $project: {
                project: {
                    _id: "$project._id",
                    name: "$project.name",
                    description: "$project.description",
                    members: "$project.members",
                    createdAt: "$project.createdAt",
                    createdBy: "$project.createdBy",
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Project Fetched Successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    const project = await Project.findById(projectId)

    if(!project) {
        throw new ApiError(404, "Project not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {project},
            "Project Fetched Successfully"
        )
    )
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id), // this return string but in order to make it 100% mongo db id
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    return res
        .status(200)
        .json(new ApiResponse(201, { project }, "Project Created Successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            $set: {
                name,
                description,
            },
        },
        {
            new: true,
        },
    );

    if (!project) {
        throw new ApiError(404, "Project Not Found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                project,
            },
            "Project Updated Successfully",
        ),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project Not Found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                project,
            },
            "Project Deleted Successfully",
        ),
    );
});

const addMembersToProject = asyncHandler(async (req, res) => {
    const {email, role} = req.body;
    const {projectId} = req.params;

    const user = await User.findOne({email})

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    /* So basically what we are doing below is we are finding one document in project member who has user and project but if we do not find the document we will create a new document which will have 3 fields user, project, role this happens due to upsert if we use upsert then if document does not exist it will be created with values that are present */
    await ProjectMember.findOneAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId)
        },
        { 
            $set: {
                role 
            } 
        },
        {
            new: true,
            upsert: true // What upsert: true means: If document exists → UPDATE If document does not exist → CREATE
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Project Member Added"
        )
    )
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const {productId} = req.params;
    const project = await Project.findById(productId);

    if(!project) {
        throw new ApiError(404, "Project not Found")
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(project._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ]);
});

const updateMemberRole = asyncHandler(async (req, res) => {
    //test
});

const deleteMember = asyncHandler(async (req, res) => {
    //test
});

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember,
};
