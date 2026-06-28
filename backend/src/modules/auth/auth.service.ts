import { UserRepository } from '../users/user.repository';
import { HashHelper } from '../../utils/hash';
import { JwtHelper } from '../../utils/jwt';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: { name: string; email: string; password: string; role?: 'ADMIN' | 'USER' }) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await HashHelper.hash(data.password);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'USER',
    });

    // Strip password from the response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordMatch = await HashHelper.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = JwtHelper.generateToken({
      userId: user.id,
      role: user.role as 'ADMIN' | 'USER',
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
