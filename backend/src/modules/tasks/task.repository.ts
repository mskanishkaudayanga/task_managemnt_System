import { prisma } from '../../config/db';
import { Prisma, Task } from '@prisma/client';

export interface FindAllTasksParams {
  skip: number;
  take: number;
  search?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string;
  sortBy: 'createdAt' | 'dueDate';
  sortOrder: 'asc' | 'desc';
  restrictToUserId?: string;
}

export class TaskRepository {
  async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async findAll(params: FindAllTasksParams) {
    const {
      skip,
      take,
      search,
      status,
      priority,
      assignedToId,
      sortBy,
      sortOrder,
      restrictToUserId,
    } = params;

    const where: Prisma.TaskWhereInput = {};
    const andConditions: Prisma.TaskWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (priority) {
      andConditions.push({ priority });
    }

    if (assignedToId) {
      andConditions.push({ assignedToId });
    }

    if (restrictToUserId) {
      andConditions.push({
        OR: [
          { createdById: restrictToUserId },
          { assignedToId: restrictToUserId },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async update(id: string, data: Prisma.TaskUncheckedUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }
}
