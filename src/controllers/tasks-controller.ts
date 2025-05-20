import {Request, Response} from "express"
import {z} from "zod"
import {prisma} from "@/database/prisma"
import { AppError } from "@/utils/AppError"

class TasksController{
    async create(request: Request, response: Response){
      const bodySchema = z.object({
        title: z.string().trim().min(2),
        description: z.string().trim().min(2),
        status: z.enum(["pending","in_progress","completed","canceled"]),
        priority: z.enum(["high","medium","low"]),
        assigned_to: z.string().uuid(),
        team_id: z.string().uuid()
      })

      const { title, description, status, priority, assigned_to, team_id} = bodySchema.parse(request.body)

      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId: assigned_to,
          teamId: team_id,
        }
      })

      if (!isMember) {
        throw new AppError("The user does not belong to this team.", 400);
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          assignedTo: assigned_to,
          teamId: team_id
        }
      })

      return response.status(201).json(task)
    }
}

export {TasksController}