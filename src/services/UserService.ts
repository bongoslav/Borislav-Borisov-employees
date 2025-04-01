import { Service } from 'typedi';
import { prisma } from '../app';
import bcrypt from 'bcrypt';

@Service()
export class UserService {
  async findAll() {
    return prisma.user.findMany();
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user;
  }

  async create(userData: { name: string; email: string; password: string; }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }
    if (!userData.password) {
      throw new Error('Password is required');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      }
    });

    return user;
  }

  async update(id: number, userData: { name: string; email: string; }) {
    return prisma.user.update({
      where: { id },
      data: userData
    });
  }

  async delete(id: number) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User does not exist');
    }

    await prisma.user.delete({
      where: { id }
    });
    
    return { success: true, message: 'User deleted successfully' };
  }
}
