import { Router } from "express"

import { TasksController } from "@/controllers/tasks-controller"

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const tasksRoutes = Router()
const tasksController = new TasksController()

tasksRoutes.use(ensureAuthenticated)

tasksRoutes.post("/", verifyUserAuthorization(["admin"]), tasksController.create)
tasksRoutes.get("/", verifyUserAuthorization(["member","admin"]), tasksController.index)
tasksRoutes.put("/:id", verifyUserAuthorization(["member","admin"]), tasksController.update)
tasksRoutes.delete("/:id", verifyUserAuthorization(["admin"]), tasksController.remove)

export {tasksRoutes}