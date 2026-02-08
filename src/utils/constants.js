export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRolesEnum); // Object.values takes values from object and converts them into array ["admin", "project_admin", "member"]

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    DONE: "done"
}

export const AvailableTaskStatues = Object.values(TaskStatusEnum)