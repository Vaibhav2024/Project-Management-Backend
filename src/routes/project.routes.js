import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getProjects, getProjectById, createProject, updateProject, deleteProject, addMembersToProject, getProjectMembers, updateMemberRole, deleteMember } from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMemberToProjectValidator } from "../validators/index.js";
import { validateProjectPermission } from "../middlewares/auth.middleware.js"
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.models.js";

const router = Router();
router.use(verifyJWT); // if you want to make all routes secured route so that every api call in this route is by varified users you can use router.use(verify) it will apply this middleware to all of them

router.route("/").get(getProjects).post(createProjectValidator(), validate, createProject);
router.route("/:projectId").get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), createProjectValidator(), validate, updateProject)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router.route("/:projectId/members").get(getProjectMembers).post(validateProjectPermission([UserRolesEnum.ADMIN]), addMemberToProjectValidator(), validate, addMembersToProject);

router.route("/:projectId/members/:userId").put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember)

export default router;