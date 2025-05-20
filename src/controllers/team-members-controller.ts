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

  async index(request: Request, response: Response){
    const rawMembers = await prisma.teamMember.findMany({
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

    const members = rawMembers.map(member => ({

      memberId: member.id,
      user: {
          userId: member.user.id,
          name: member.user.name,
          email: member.user.email,
      },
      team: {
          teamId: member.team.id,
          teamName: member.team.name,
          teamDescription: member.team.description,
      },

    }));
    return response.json(members)
  }
}

export {TeamMembersController}