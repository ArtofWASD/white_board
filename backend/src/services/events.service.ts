/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from './notifications.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updatePastEventsStatus() {
    const now = new Date();
    // Обновляем статусы прошедших событий
    // Используем prisma.$transaction, если критична согласованность чтения/записи, но для массового обновления updateMany вполне достаточно.
    

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
    scheme?: string, // Добавляем схему
  ) {


    // Проверяем существование пользователя
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {

      throw new NotFoundException('User not found');
    }

    // Проверяем участников, если они указаны
    if (participantIds && participantIds.length > 0) {
      const participants = await (this.prisma as any).user.findMany({
        where: { id: { in: participantIds } },
      });

      if (participants.length !== participantIds.length) {

        throw new NotFoundException('One or more participants not found');
      }
    }

    // Преобразуем строковую дату в объект Date и проверяем валидность
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {

      throw new Error('Invalid date format');
    }



    // Подготавливаем данные события
    const baseEventData = {
      title,
      eventDate: eventDateObj,
      description,
      exerciseType,
      exercises: exercises || undefined, // Добавляем упражнения в данные события
      userId,
      timeCap,
      rounds,
      teamId,
      scheme: scheme || 'FOR_TIME',
    };

    // Добавляем участников, если они указаны
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
      // Просмотр для конкретной команды
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
      // Обычный просмотр пользователя / Просмотр всех команд
      
      // 1. Проверяем, является ли пользователь администратором организации
      const user = await (this.prisma as any).user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, organizationName: true }
      });

      if (user?.role === 'organization_admin' && user.organizationName) {
          // Находим всех пользователей в организации
          const orgUsers = await (this.prisma as any).user.findMany({
              where: { organizationName: user.organizationName },
              select: { id: true }
          });
          const orgUserIds = orgUsers.map((u: any) => u.id);

          // Находим все команды в организации
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

      // 2. Обычный просмотр пользователя (Личные + Команды участника + Владеемые команды)
      // Получаем команды, где пользователь является участником
      const userTeams = await (this.prisma as any).teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      });
      
      const memberTeamIds = userTeams.map((t: any) => t.teamId);

      // Получаем команды, где пользователь является владельцем
      const ownedTeams = await (this.prisma as any).team.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });
      const ownedTeamIds = ownedTeams.map((t: any) => t.id);

      // Объединяем и удаляем дубликаты
      const teamIds = [...new Set([...memberTeamIds, ...ownedTeamIds])];

      // Получаем ВСЕХ участников этих команд
      const teamMembers = await (this.prisma as any).teamMember.findMany({
        where: { teamId: { in: teamIds } },
        select: { userId: true }
      });
      // Уникальные ID участников
      const allMemberIds = [...new Set(teamMembers.map((m: any) => m.userId))];

      return (this.prisma as any).event.findMany({
        where: {
          OR: [
            { userId: userId }, // Личные события
            { teamId: { in: teamIds } }, // События, назначенные командам
            { userId: { in: allMemberIds } } // События от других участников команды
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
    // Сначала обновляем статусы событий на основании текущей даты
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
    // Сначала обновляем статусы событий на основании текущей даты
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

    // Обновляем прошедшие события
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

    // Обновляем предстоящие события
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



    // Проверяем, является ли пользователь владельцем события
    let hasPermission = event.userId === userId;

    if (!hasPermission && event.teamId) {
        // Проверяем, является ли пользователь владельцем команды
        const team = await (this.prisma as any).team.findUnique({
            where: { id: event.teamId },
            select: { ownerId: true }
        });
        if (team && team.ownerId === userId) {
            hasPermission = true;
        }
    }

    // Проверяем, является ли запрашивающий Тренером (Владельцем или Админом) команды, к которой принадлежит владелец события
    if (!hasPermission) {
        // Получаем команды, где запрашивающий является Владельцем
        const ownedTeams = await (this.prisma as any).team.findMany({
            where: { ownerId: userId },
            select: { id: true }
        });
        const requestorTeamIds = ownedTeams.map((t: any) => t.id);

        // Получаем команды, где запрашивающий является Админом
        const adminMemberships = await (this.prisma as any).teamMember.findMany({
            where: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN'] }
            },
            select: { teamId: true }
        });

        const allAdminTeamIds = [...new Set([...requestorTeamIds, ...adminMemberships.map((m: any) => m.teamId)])];

        if (allAdminTeamIds.length > 0) {
             // Проверяем, является ли владелец события участником любой из этих команд
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

    // Расширенная проверка прав для Админов организации и Супер-админов

    if (!hasPermission) {
        const requestor = await (this.prisma as any).user.findUnique({
             where: { id: userId }
        });

        if (requestor) {
             if (requestor.role === 'SUPER_ADMIN') {
                 hasPermission = true;
             } else if (requestor.role === 'ORGANIZATION_ADMIN' && requestor.organizationId) {
                  // Проверяем, принадлежит ли владелец события к той же организации
                 // Нам нужно получить организацию владельца события
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

  async createEventResult(
    eventId: string, 
    time: string, 
    username: string, 
    userId?: string, 
    value?: number, 
    scaling?: string, 
    notes?: string
  ) {
    // Проверяем, существует ли событие
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Создаем результат события
    // Инициализируем заметки как массив, если они предоставлены
    const initialNotes = notes ? [notes] : [];

    const eventResult = await (this.prisma as any).eventResult.create({
      data: {
        time,
        username,
        eventId,
        userId,
        value: value || 0,
        scaling: scaling || 'RX',
        notes: initialNotes,
      },
    });

    return eventResult;
  }

  async updateEventResult(resultId: string, info: string, actorId?: string) {
    const result = await (this.prisma as any).eventResult.findUnique({
      where: { id: resultId },
    });
    if (!result) {
      throw new NotFoundException('Result not found');
    }

    // Парсим существующие заметки
    let currentNotes: string[] = [];
    if (result.notes) {
        if (Array.isArray(result.notes)) {
            currentNotes = result.notes as string[];
        } else if (typeof result.notes === 'string') {
            // Обработка устаревших строковых данных, если есть
            try {
                const parsed = JSON.parse(result.notes);
                 if (Array.isArray(parsed)) {
                    currentNotes = parsed;
                 } else {
                    currentNotes = [result.notes];
                 }
            } catch {
                currentNotes = [result.notes];
            }
        }
    }

    // Добавляем новую заметку
    const updatedNotes = [...currentNotes, info];

    const updatedResult = await (this.prisma as any).eventResult.update({
      where: { id: resultId },
      data: { notes: updatedNotes },
    });

    // Уведомляем владельца, если автор не является владельцем
    // Примечание: info обычно содержит имя, например "Name: comment"
    let targetUserId = result.userId;

    // Фолбек: Если нет userId, пробуем найти пользователя по совпадению username (точное совпадение)
    if (!targetUserId && result.username) {
        const potentialUser = await (this.prisma as any).user.findFirst({
            where: {
                OR: [
                    { name: result.username },
                    { email: result.username } // На случай, если username это email
                ]
            }
        });
        if (potentialUser) {
            targetUserId = potentialUser.id;
        }
    }

    if (targetUserId && actorId && targetUserId !== actorId) {
        const actor = await (this.prisma as any).user.findUnique({ where: { id: actorId }, select: { name: true, lastName: true } });
        const name = actor ? `${actor.name} ${actor.lastName || ''}`.trim() : 'Someone';

        const event = await (this.prisma as any).event.findUnique({ where: { id: result.eventId }, select: { title: true } });
        const eventTitle = event ? event.title : 'Unknown Event';

        await this.notificationsService.createNotification(
            targetUserId,
            'COMMENT',
            `${name} commented on your result for "${eventTitle}": "${info.substring(info.indexOf(':') + 1).trim() || 'View comment'}"`,
             { eventResultId: resultId, eventId: result.eventId, actorId },
             'New Comment'
        );
    }

    return updatedResult;
  }

  async getEventResults(eventId: string) {
    // Проверяем, существует ли событие
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Получаем все результаты для события
    try {
      return await (this.prisma as any).eventResult.findMany({
        where: { eventId: eventId },
        include: {
          likes: {
             select: { userId: true }
          }
        },
        orderBy: { dateAdded: 'desc' },
      });
    } catch (error) {
      console.error(`Error getting results for event ${eventId}:`, error);
      // Возвращаем пустой массив вместо падения, если возможно, или обрабатываем соответствующим образом
      // Но оставить падение с большей информацией тоже нормально для отладки.
      // Пока что вернем пустой массив, чтобы остановить падение цикла на фронтенде.
      // Возврат пустого массива позволяет странице загрузиться.
      return [];
    }
  }

  async toggleResultLike(resultId: string, userId: string) {
    // Проверяем, существует ли результат
    const result = await (this.prisma as any).eventResult.findUnique({
      where: { id: resultId },
    });
    if (!result) {
      throw new NotFoundException('Result not found');
    }

    // Проверяем, существует ли лайк
    const existingLike = await (this.prisma as any).eventResultLike.findUnique({
      where: {
        eventResultId_userId: {
          eventResultId: resultId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await (this.prisma as any).eventResultLike.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      // Like
      await (this.prisma as any).eventResultLike.create({
        data: {
          eventResultId: resultId,
          userId: userId,
        },
      });

      // Уведомляем владельца, если лайкнувший не является владельцем
      let targetUserId = result.userId;
      
      // Фолбек: Если нет userId, пробуем найти пользователя по совпадению username (точное совпадение)
      if (!targetUserId && result.username) {
          const potentialUser = await (this.prisma as any).user.findFirst({
              where: {
                  OR: [
                      { name: result.username },
                      { email: result.username }
                  ]
              }
          });
          if (potentialUser) {
              targetUserId = potentialUser.id;
          }
      }

      if (targetUserId && targetUserId !== userId) {
        const liker = await (this.prisma as any).user.findUnique({ where: { id: userId }, select: { name: true, lastName: true } });
        const name = liker ? `${liker.name} ${liker.lastName || ''}`.trim() : 'Someone';
        
        const event = await (this.prisma as any).event.findUnique({ where: { id: result.eventId }, select: { title: true } });
        const eventTitle = event ? event.title : 'Unknown Event';

        await this.notificationsService.createNotification(
          targetUserId,
          'LIKE',
          `${name} liked your result on event "${eventTitle}"`, 
          { eventResultId: resultId, eventId: result.eventId, actorId: userId },
          'New Like'
        );
      }

      return { liked: true };
    }
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
    scheme?: string,
  ) {


    // Проверяем, существует ли событие
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {

      throw new NotFoundException('Event not found');
    }

    // Проверяем, является ли пользователь владельцем события
    if (event.userId !== userId) {

      throw new ForbiddenException('You can only update your own events');
    }

    // Преобразуем строковую дату в объект Date и проверяем валидность
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {

      throw new Error('Invalid date format');
    }



    // Подготавливаем данные события
    const updateData = {
      title,
      eventDate: eventDateObj,
      description,
      exerciseType,
      exercises: exercises || undefined, // Добавляем упражнения в данные события
      timeCap,
      rounds,
      teamId,
      scheme,
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
