import {Request, Response} from "express"
import {z} from "zod"
import { prisma } from "@/database/prisma"

class TeamMembersController {
  async create(request: Request, response: Response){
    const bodySchema = z.object({
      user_id: z.string().uuid(),
      team_id: z.string().uuid(),
    })

    const {user_id, team_id} = bodySchema.parse(request.body)

    await prisma.teamMember.create({
      data: {
        userId: user_id,
        teamId: team_id
      }
    })

    return response.status(201).json()
  }
}

export {TeamMembersController}