import {Request, Response} from "express"
import {prisma} from "@/database/prisma"
import {z} from "zod"
import { AppError } from "@/utils/AppError"

class TeamsController {
  async create(request: Request, response: Response){
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      description: z.string().trim().min(2)
    })

    const {name, description} = bodySchema.parse(request.body)

    const team = await prisma.team.create({
      data: {
        name, 
        description
      }
    })

    return response.status(201).json(team)
  }

  async index(request: Request, response: Response){
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        members:{
          include: {
            user: { 
              select: {id: true, name: true, email: true}
            },
          }
        }
      }
    })



    return response.json(teams)
  }

  async update(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    })

    const {id} = paramsSchema.parse(request.params)
    const {name, description} = bodySchema.parse(request.body)

    await prisma.team.update({
      data:{
        name,
        description,
      },
      where: {
        id,
      }
    })

    return response.json()
  }

  async remove(request: Request, response: Response){
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const teamExists = await prisma.team.findFirst({
        where: { id },
        include: { members: true },
      })

      if(!teamExists){
        throw new AppError("Team not found", 404)
      }

      if (teamExists.members.length > 0) {
        throw new AppError("Delete team members first!")
      }

      await prisma.team.delete({
        where: {id}
      })

      return response.status(204).json();
  }

  async forceRemove(request: Request, response: Response){
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const teamExists = await prisma.team.findFirst({
        where: { id },
        include: { members: true },
      })

      if (!teamExists) {
          throw new AppError("Team not found", 404)
      }

      await prisma.teamMember.deleteMany({
        where: {
          teamId: id,
        },
      })

      await prisma.team.delete({
        where: {
          id,
        },
      })

      return response.status(204).json()
  }
  
}

export {TeamsController}