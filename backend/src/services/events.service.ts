/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updatePastEventsStatus() {
    const now = new Date();
    // Use prisma.$transaction if consistent read/write is critical, but for this bulk update direct updateMany is fine.
    
    // Find and update all events that are in the past but marked as FUTURE
    // Note: status 'COMPLETED' matches the enum value for 'past' events logic I want to enforce.
    // The user request said "past" status. The enum has "COMPLETED".
    // Let's verify the enum again. 
    // Enum EventStatus { FUTURE, COMPLETED, CANCELLED }
    // The user wants "past". I will assume COMPLETED is the intended status for past events, 
    // or checks in getPastEventsByUserId use 'past'.
    // Looking at getPastEventsByUserId (line 215): where: { status: 'past' }
    // Wait, the prisma schema uses Enum EventStatus { FUTURE, COMPLETED, CANCELLED }
    // But getPastEventsByUserId uses string 'past'? 
    // This implies there might be a mismatch or 'past' is just a string literal in the query that prisma might map?
    // Actually, looking at the schema: model Event { status EventStatus ... }
    // So status MUST be one of the enum values.
    // Line 215: status: 'past' looks suspicious if the enum is key-based.
    // Let's check updateEventStatuses implementation in lines 262-290.
    // It uses 'past' and 'future'. This is very strange if the enum is FUTURE/COMPLETED.
    // Ah, prisma might be mapping strings? Or the schema I saw earlier:
    // enum EventStatus { FUTURE, COMPLETED, CANCELLED }
    // If the code is using 'past' and 'future', then maybe the enum values are lower cased?
    // Or I misread the schema or there is a type mismatch in the existing code.
    // I see `status: 'future'` in lines 236, 271, 287.
    // I see `status: 'past'` in lines 215, 274, 284.
    // The schema I read in step 22:
    // enum EventStatus { FUTURE, COMPLETED, CANCELLED }
    // Providing 'past' to an enum field usually fails in Prisma unless mapped.
    // However, the existing `updateEventStatuses` function (lines 262-290) is ALREADY implementing this logic!
    // It updates `future` to `past` and `past` to `future` based on date.
    // Is it possible the enum in the DB is different or I am seeing an old file version?
    // Or `EventStatus` is not used in the specific lines despite the model definition?
    // Let's look at `updateEventStatuses` (lines 262-290) again. 
    // It updates events where date < now AND status = 'future' to 'past'.
    // If the user says "currently events that passed are still upcoming", maybe `updateEventStatuses` is NOT being called automatically?
    // Lines 209 and 229 call `this.updateEventStatuses()` whenever `getPastEventsByUserId` or `getFutureEventsByUserId` is called.
    // The user wants it to happen for ALL events, not just when a user checks their list.
    // So the logic exists, but it's only triggered on read for a specific user?
    // Actually `updateEventStatuses` calls `updateMany` globally! 
    // `await (this.prisma as any).event.updateMany(...)` 
    // This updates ALL events.
    // So existing logic DOES update all events, but it's lazy-loaded.
    // If no one calls `getPastEventsByUserId`, no updates happen.
    // The User wants to organize the process of changing status not just for chosen athlete but for ALL events.
    // So scheduling this existing method is the way to go.
    
    // One catch: The schema says FUTURE/COMPLETED. The code says 'future'/'past'.
    // If this code currently works, then the Enum might handle lowercase or the schema IS 'future'/'past'.
    // Let's trust the existing code pattern for values, but I will double check schema if I get errors.
    // actually, I should just Call the existing `updateEventStatuses` from the Cron job!
    

  }

  async createEvent(
    userId: string,
    title: string,
    eventDate: string,
    description?: string,
    exerciseType?: string,
    exercises?: any[],
    participantIds?: string[],
    timeCap?: string,
    rounds?: string,
    teamId?: string,
  ) {


    // Check if user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {

      throw new NotFoundException('User not found');
    }

    // Validate participants if provided
    if (participantIds && participantIds.length > 0) {
      const participants = await (this.prisma as any).user.findMany({
        where: { id: { in: participantIds } },
      });

      if (participants.length !== participantIds.length) {

        throw new NotFoundException('One or more participants not found');
      }
    }

    // Convert string date to Date object and validate
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {

      throw new Error('Invalid date format');
    }



    // Prepare event data
    const baseEventData = {
      title,
      eventDate: eventDateObj,
      description,
      exerciseType,
      exercises: exercises || undefined, // Add exercises to the event data
      userId,
      timeCap,
      rounds,
      teamId,
    };

    // Add participants if provided
    const createData =
      participantIds && participantIds.length > 0
        ? {
            ...baseEventData,
            participants: {
              connect: participantIds.map((id) => ({ id })),
            },
          }
        : baseEventData;


    const event = await (this.prisma as any).event.create({
      data: createData,
    });


    return event;
  }

  async getEventsByUserId(userId: string, teamId?: string) {
    if (teamId) {
      // Specific Team View
      const teamMembers = await (this.prisma as any).teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });
      
      const memberIds = teamMembers.map((m: any) => m.userId);

      return (this.prisma as any).event.findMany({
        where: {
          OR: [
            { teamId: teamId },
            { userId: { in: memberIds } },
          ],
        },
        orderBy: { eventDate: 'asc' },
        include: {
          results: {
            orderBy: {
              dateAdded: 'desc',
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
              lastName: true,
            }
          },
        },
      });
    } else {
      // Normal User View / All Teams View
      
      // 1. Check if user is Organization Admin
      const user = await (this.prisma as any).user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, organizationName: true }
      });

      if (user?.role === 'organization_admin' && user.organizationName) {
          // Find all users in org
          const orgUsers = await (this.prisma as any).user.findMany({
              where: { organizationName: user.organizationName },
              select: { id: true }
          });
          const orgUserIds = orgUsers.map((u: any) => u.id);

          // Find all teams in org
          const orgTeams = await (this.prisma as any).team.findMany({
              where: { organizationName: user.organizationName },
              select: { id: true }
          });
          const orgTeamIds = orgTeams.map((t: any) => t.id);

          return (this.prisma as any).event.findMany({
            where: {
              OR: [
                { userId: { in: orgUserIds } },
                { teamId: { in: orgTeamIds } },
              ],
            },
            orderBy: { eventDate: 'asc' },
            include: {
              results: {
                orderBy: {
                  dateAdded: 'desc',
                },
              },
              participants: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                }
              },
            },
          });
      }

      // 2. Normal User View (Personal + Member Teams + Owned Teams)
      // Fetch teams where user is a member
      const userTeams = await (this.prisma as any).teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      });
      
      const memberTeamIds = userTeams.map((t: any) => t.teamId);

      // Fetch teams where user is owner
      const ownedTeams = await (this.prisma as any).team.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });
      const ownedTeamIds = ownedTeams.map((t: any) => t.id);

      // Combine and unique
      const teamIds = [...new Set([...memberTeamIds, ...ownedTeamIds])];

      // Fetch ALL members of these teams
      const teamMembers = await (this.prisma as any).teamMember.findMany({
        where: { teamId: { in: teamIds } },
        select: { userId: true }
      });
      // Unique member IDs
      const allMemberIds = [...new Set(teamMembers.map((m: any) => m.userId))];

      return (this.prisma as any).event.findMany({
        where: {
          OR: [
            { userId: userId }, // Personal events
            { teamId: { in: teamIds } }, // Events assigned to teams
            { userId: { in: allMemberIds } } // Events from other team members
          ],
        },
        orderBy: { eventDate: 'asc' },
        include: {
          results: {
            orderBy: {
              dateAdded: 'desc',
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
              lastName: true,
            }
          },
        },
      });
    }
  }


  async getPastEventsByUserId(userId: string) {
    // First update event statuses based on current date
    await this.updateEventStatuses();

    return (this.prisma as any).event.findMany({
      where: {
        userId,
        status: 'past',
      },
      orderBy: { eventDate: 'desc' },
        include: {
          results: {
            orderBy: {
              dateAdded: 'desc',
            },
          },
          participants: {
             select: {
              id: true,
              name: true,
              lastName: true
            }
          }
        },
    });
  }

  async getFutureEventsByUserId(userId: string) {
    // First update event statuses based on current date
    await this.updateEventStatuses();

    return (this.prisma as any).event.findMany({
      where: {
        userId,
        status: 'future',
      },
      orderBy: { eventDate: 'asc' },
      include: {
        results: {
          orderBy: {
            dateAdded: 'desc',
          },
        },
      },
    });
  }

  async updateEventStatus(eventId: string, status: 'past' | 'future') {
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return (this.prisma as any).event.update({
      where: { id: eventId },
      data: { status },
    });
  }

  async updateEventStatuses(): Promise<void> {
    const now = new Date();

    // Update past events
    await (this.prisma as any).event.updateMany({
      where: {
        eventDate: {
          lt: now,
        },
        status: 'future',
      },
      data: {
        status: 'past',
      },
    });

    // Update future events
    await (this.prisma as any).event.updateMany({
      where: {
        eventDate: {
          gte: now,
        },
        status: 'past',
      },
      data: {
        status: 'future',
      },
    });
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {


    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {

      throw new NotFoundException('Event not found');
    }



    // Check if the user is the owner of the event
    let hasPermission = event.userId === userId;

    if (!hasPermission && event.teamId) {
        // Check if user is owner of the team
        const team = await (this.prisma as any).team.findUnique({
            where: { id: event.teamId },
            select: { ownerId: true }
        });
        if (team && team.ownerId === userId) {
            hasPermission = true;
        }
    }

    // Check if the requestor is a Coach (Owner or Admin) of a team the event owner belongs to
    if (!hasPermission) {
        // Get teams where requestor is Owner
        const ownedTeams = await (this.prisma as any).team.findMany({
            where: { ownerId: userId },
            select: { id: true }
        });
        const requestorTeamIds = ownedTeams.map((t: any) => t.id);

        // Get teams where requestor is Admin
        const adminMemberships = await (this.prisma as any).teamMember.findMany({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] }
            },
            select: { teamId: true }
        });

        const allAdminTeamIds = [...new Set([...requestorTeamIds, ...adminMemberships.map((m: any) => m.teamId)])];

        if (allAdminTeamIds.length > 0) {
             // Check if event owner is a member of any of these teams
             const targetMembership = await (this.prisma as any).teamMember.findFirst({
                 where: {
                     userId: event.userId,
                     teamId: { in: allAdminTeamIds }
                 }
             });

             if (targetMembership) {
                 hasPermission = true;
             }
        }
    }

    // Extended permission check for Organization Admins and Super Admins

    if (!hasPermission) {
        const requestor = await (this.prisma as any).user.findUnique({
             where: { id: userId }
        });

        if (requestor) {
             if (requestor.role === 'SUPER_ADMIN') {
                 hasPermission = true;
             } else if (requestor.role === 'ORGANIZATION_ADMIN' && requestor.organizationId) {
                 // Check if event owner belongs to the same organization
                 // We need to fetch event owner's org
                 const eventOwner = await (this.prisma as any).user.findUnique({
                      where: { id: event.userId },
                      select: { organizationId: true }
                 });
                 if (eventOwner && eventOwner.organizationId === requestor.organizationId) {
                      hasPermission = true;
                 }
             }
        }
    }

    if (!hasPermission) {
      throw new ForbiddenException('You can only delete your own events or events in your team');
    }


    await (this.prisma as any).event.delete({
      where: { id: eventId },
    });

  }

  async createEventResult(eventId: string, time: string, username: string, userId?: string) {
    // Check if event exists
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Create event result
    const eventResult = await (this.prisma as any).eventResult.create({
      data: {
        time,
        username,
        eventId,
        userId,
      },
    });

    return eventResult;
  }

  async getEventResults(eventId: string) {
    // Check if event exists
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Get all results for the event
    return (this.prisma as any).eventResult.findMany({
      where: { eventId: eventId },
      orderBy: { dateAdded: 'desc' },
    });
  }

  async getEventResultsByUserId(userId: string) {
    return (this.prisma as any).eventResult.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            title: true,
            eventDate: true,
            exerciseType: true,
          }
        }
      },
      orderBy: { dateAdded: 'desc' },
    });
  }

  async updateEvent(
    eventId: string,
    userId: string,
    title: string,
    eventDate: string,
    description?: string,
    exerciseType?: string,
    exercises?: any[],
    timeCap?: string,
    rounds?: string,
    teamId?: string,
  ) {


    // Check if event exists
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {

      throw new NotFoundException('Event not found');
    }

    // Check if the user is the owner of the event
    if (event.userId !== userId) {

      throw new ForbiddenException('You can only update your own events');
    }

    // Convert string date to Date object and validate
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {

      throw new Error('Invalid date format');
    }



    // Prepare event data
    const updateData = {
      title,
      eventDate: eventDateObj,
      description,
      exerciseType,
      exercises: exercises || undefined, // Add exercises to the event data
      timeCap,
      rounds,
      teamId,
    };


    const updatedEvent = await (this.prisma as any).event.update({
      where: { id: eventId },
      data: updateData,
    });


    return updatedEvent;
  }
  async getDebugInfo(userId: string) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found' };

    const memberTeams = await (this.prisma as any).teamMember.findMany({ where: { userId } });
    const ownedTeams = await (this.prisma as any).team.findMany({ where: { ownerId: userId } });
    
    const memberTeamIds = memberTeams.map(t => t.teamId);
    const ownedTeamIds = ownedTeams.map(t => t.id);
    const allTeamIds = [...new Set([...memberTeamIds, ...ownedTeamIds])];

    const teamMembers = await (this.prisma as any).teamMember.findMany({
        where: { teamId: { in: allTeamIds } },
        select: { userId: true, teamId: true }
    });
    
    const events = await (this.prisma as any).event.findMany({
        where: {
            OR: [
                { userId: userId },
                { teamId: { in: allTeamIds } },
                { userId: { in: teamMembers.map(m => m.userId) } }
            ]
        },
        take: 20
    });

    return {
        user: { id: user.id, name: user.name, email: user.email },
        teams: {
            member: memberTeams,
            owned: ownedTeams,
            allIds: allTeamIds
        },
        teammates: teamMembers,
        eventsFoundCount: events.length,
        sampleEvents: events
    };
  }
}
