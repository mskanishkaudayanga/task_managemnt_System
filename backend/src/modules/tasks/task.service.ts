import { TaskRepository } from './task.repository';
import { UserRepository } from '../users/user.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }

  async createTask(
    data: {
      title: string;
      description: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate: string;
      assignedToId?: string | null;
    },
    createdById: string
  ) {
    if (data.assignedToId) {
      const assigneeExists = await this.userRepository.findById(data.assignedToId);
      if (!assigneeExists) {
        throw new BadRequestError('Assigned user does not exist');
      }
    }

    return this.taskRepository.create({
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: new Date(data.dueDate),
      createdById,
      assignedToId: data.assignedToId || null,
    });
  }

  async getTasks(
    query: {
      page: number;
      limit: number;
      search?: string;
      status?: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      assignedToId?: string;
      sortBy: 'createdAt' | 'dueDate';
      sortOrder: 'asc' | 'desc';
    },
    currentUser: { id: string; role: 'ADMIN' | 'USER' }
  ) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const restrictToUserId = currentUser.role !== 'ADMIN' ? currentUser.id : undefined;

    const { tasks, total } = await this.taskRepository.findAll({
      skip,
      take,
      search: query.search,
      status: query.status,
      priority: query.priority,
      assignedToId: query.assignedToId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      restrictToUserId,
    });

    return {
      tasks,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getTaskById(taskId: string, currentUser: { id: string; role: 'ADMIN' | 'USER' }) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      task.createdById !== currentUser.id &&
      task.assignedToId !== currentUser.id
    ) {
      throw new ForbiddenError('You do not have access to view this task');
    }

    return task;
  }

  async updateTask(
    taskId: string,
    updateData: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      status?: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
      dueDate?: string;
      assignedToId?: string | null;
    },
    currentUser: { id: string; role: 'ADMIN' | 'USER' }
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only creator or admin can update task details
    if (currentUser.role !== 'ADMIN' && task.createdById !== currentUser.id) {
      throw new ForbiddenError('Only the task creator or an admin can edit task details');
    }

    if (updateData.assignedToId) {
      const assigneeExists = await this.userRepository.findById(updateData.assignedToId);
      if (!assigneeExists) {
        throw new BadRequestError('Assigned user does not exist');
      }
    }

    const prismaUpdateData: any = { ...updateData };
    if (updateData.dueDate) {
      prismaUpdateData.dueDate = new Date(updateData.dueDate);
    }

    return this.taskRepository.update(taskId, prismaUpdateData);
  }

  async updateTaskStatus(
    taskId: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE',
    currentUser: { id: string; role: 'ADMIN' | 'USER' }
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Creator, Assignee, or Admin can update status
    if (
      currentUser.role !== 'ADMIN' &&
      task.createdById !== currentUser.id &&
      task.assignedToId !== currentUser.id
    ) {
      throw new ForbiddenError('You must be the task creator, assignee, or an admin to update task status');
    }

    return this.taskRepository.update(taskId, { status });
  }

  async deleteTask(taskId: string, currentUser: { id: string; role: 'ADMIN' | 'USER' }) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only creator or admin can delete task
    if (currentUser.role !== 'ADMIN' && task.createdById !== currentUser.id) {
      throw new ForbiddenError('Only the task creator or an admin can delete this task');
    }

    return this.taskRepository.delete(taskId);
  }
}
