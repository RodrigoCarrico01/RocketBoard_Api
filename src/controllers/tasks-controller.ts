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
    async index(request: Request, response: Response){

      if(request.user?.role === "member"){
        const member = await prisma.teamMember.findFirst({
          where: {
            userId: request.user?.id
          }
        })

        const task = await prisma.task.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          },
          where: {
            teamId: member?.teamId
          }
        })

        return response.json(task)
      } else if (request.user?.role === "admin"){
        const task = await prisma.task.findMany({          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        })
        return response.json(task)
      }
    }
    async update(request: Request, response: Response){
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const bodySchema = z.object({
        title: z.string().trim().min(2).optional(),
        description: z.string().trim().min(2).optional(),
        status: z.enum(["pending","in_progress","completed","canceled"]).optional(),
        priority: z.enum(["high","medium","low"]).optional(),
        assigned_to: z.string().uuid().optional(),
      })

      if(request.user?.role === "member"){
        const member = await prisma.teamMember.findFirst({
          where: {
            userId: request.user?.id
          }
        })

        if(!member){
          throw new AppError("You are not a member of any team.", 403)
        }

        const {id} = paramsSchema.parse(request.params)
        const {title, description, status, priority, assigned_to} = bodySchema.parse(request.body)

        const task = await prisma.task.update({
          where: {
            id,
            teamId: member.teamId
          },
          data: {
            title,
            description,
            status,
            priority,
            assignedTo: assigned_to
          }
        })

        return response.json(task)



      } else if(request.user?.role === "admin") {
        const {id} = paramsSchema.parse(request.params)
        const {title, description, status, priority, assigned_to} = bodySchema.parse(request.body)

        const task = await prisma.task.update({
          where: {
            id,
          },
          data: {
            title,
            description,
            status,
            priority,
            assignedTo: assigned_to
          }
        })

        return response.json(task)
      }

    }
    async remove(request: Request, response: Response){
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const taskExists = await prisma.task.findFirst({
        where: { id },
      })

      if(!taskExists){
        throw new AppError("Task not found", 404)
      }

      await prisma.task.delete({
        where: {id}
      })

      return response.status(204).json()
    }
}

export {TasksController}