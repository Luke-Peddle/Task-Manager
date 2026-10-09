import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { toPublicUser, UsersService } from '../users/users.service.js';
import { SignupDto } from './dto/signup.dto.js';

const PASSWORD_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await hash(dto.password, PASSWORD_ROUNDS);
    const user = await this.usersService.create({ name: dto.name, email: dto.email, passwordHash });

    return toPublicUser(user);
  }
}