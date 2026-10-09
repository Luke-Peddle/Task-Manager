import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export const toPublicUser = (user: PublicUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return this.prisma.$transaction(async (tx) => {
      const isFirstUser = (await tx.user.count()) === 0;
      const user = await tx.user.create({ data });
      if (isFirstUser) {
        await tx.task.updateMany({ where: { userId: null }, data: { userId: user.id } });
      }
      return user;
    });
  }
}