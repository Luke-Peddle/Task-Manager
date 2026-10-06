import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { StepsModule } from './steps/steps.module.js'; 
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, TasksModule, StepsModule],
})
export class AppModule {}