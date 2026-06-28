import { UserRepository } from './user.repository';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users.map(({ password: _, ...userWithoutPassword }) => userWithoutPassword);
  }

  async getUserById(id: string, currentUser: { id: string; role: 'ADMIN' | 'USER' }) {
    // Only ADMIN or the user themselves can view their user profile
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenError('You do not have permission to view this user profile');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
