import mongoose from "mongoose";
import {UserRolesEnum, AvailableUserRole} from '../utils/constants.js'

const projectMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        },
        role: {
            type: String,
            enum: AvailableUserRole,
            default: UserRolesEnum.MEMBER
        }
    }
, {timestamps: true})

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema)