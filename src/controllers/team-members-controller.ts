import {Request, Response} from "express"
import {z} from "zod"
import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"

class TeamMembersController {
  async create(request: Request, response: Response){
    const bodySchema = z.object({
      user_id: z.string().uuid(),
      team_id: z.string().uuid(),
    })

    const {user_id, team_id} = bodySchema.parse(request.body)

     const member = await prisma.teamMember.create({
      data: {
        userId: user_id,
        teamId: team_id
      }
    })

    return response.status(201).json(member)
  }

  async index(request: Request, response: Response){
    const members = await prisma.teamMember.findMany({
      select: { 
        id: true,
        user: { 
          select: {id: true, name: true, email: true}
        },
        team: {
          select:{id: true, name: true, description:true}
        },
        createdAt: true
      },
    })

    return response.json(members)
  }

  async remove(request: Request, response: Response){
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const teamMemberExists = await prisma.teamMember.findFirst({
        where: { id },
      })

      if(!teamMemberExists){
        throw new AppError("Team member not found", 404)
      }
      
      await prisma.teamMember.delete({
        where: {id}
      })

      return response.status(204).json()
  }

}

export {TeamMembersController}