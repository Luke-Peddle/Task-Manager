import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

const DAY_MS = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * DAY_MS);

const tasks = [
  {
    name: 'Renew car insurance',
    description: 'Compare quotes before the current policy lapses.',
    dueDate: inDays(-4),
    steps: [
      { name: 'Get three quotes', dueDate: inDays(-7) },
      { name: 'Call current provider', dueDate: inDays(-5) },
      { name: 'Sign new policy', dueDate: inDays(-4) },
    ],
  },
  {
    name: 'File expense report',
    description: 'September travel and conference costs.',
    dueDate: inDays(-1),
    steps: [
      { name: 'Collect receipts', dueDate: inDays(-3) },
      { name: 'Submit in portal', dueDate: inDays(-1) },
    ],
  },
  {
    name: 'Finish task manager API',
    description: 'Stats, upcoming and overdue endpoints for the dashboard.',
    dueDate: inDays(1),
    steps: [
      { name: 'Prisma schema and migration', dueDate: inDays(0) },
      { name: 'Tasks controller', dueDate: inDays(1) },
      { name: 'Seed script', dueDate: inDays(1) },
    ],
  },
  {
    name: 'Book dentist appointment',
    description: null,
    dueDate: inDays(2),
    steps: [{ name: 'Check calendar for free mornings', dueDate: inDays(1) }],
  },
  {
    name: 'Plan weekend hike',
    description: 'Pick a trail with a good lookout.',
    dueDate: inDays(5),
    steps: [
      { name: 'Choose a trail section', dueDate: inDays(3) },
      { name: 'Check the forecast', dueDate: inDays(4) },
      { name: 'Pack gear', dueDate: inDays(5) },
    ],
  },
  {
    name: 'Clean up home network',
    description: 'Update router firmware and rename old devices.',
    dueDate: inDays(6),
    steps: [
      { name: 'Back up router config', dueDate: null },
      { name: 'Update firmware', dueDate: null },
    ],
  },
  {
    name: 'Read "Designing Data-Intensive Applications"',
    description: 'One chapter a week.',
    dueDate: inDays(21),
    steps: [
      { name: 'Chapter 5', dueDate: inDays(7) },
      { name: 'Chapter 6', dueDate: inDays(14) },
      { name: 'Chapter 7', dueDate: inDays(21) },
    ],
  },
  {
    name: 'Winterize the shed',
    description: 'Before the first real snow.',
    dueDate: inDays(28),
    steps: [
      { name: 'Drain garden hoses', dueDate: inDays(14) },
      { name: 'Store patio furniture', dueDate: inDays(21) },
      { name: 'Check door seal', dueDate: inDays(28) },
    ],
  },
  {
    name: 'Update resume',
    description: 'Add recent projects and skills.',
    dueDate: inDays(35),
    steps: [
      { name: 'List recent projects', dueDate: null },
      { name: 'Rewrite summary', dueDate: null },
    ],
  },
  {
    name: 'Holiday gift list',
    description: null,
    dueDate: inDays(60),
    steps: [{ name: 'Set a budget', dueDate: inDays(30) }],
  },
  {
    name: 'Organize photo library',
    description: 'Sort recent photos into albums.',
    dueDate: null,
    steps: [],
  },
  {
    name: 'Learn NestJS guards',
    description: 'Add auth to the task manager eventually.',
    dueDate: null,
    steps: [{ name: 'Read the guards docs', dueDate: null }],
  },
];

async function main() {
  await prisma.task.deleteMany();
  const now = Date.now();

  for (const { steps, ...task } of tasks) {
    const isPast = (date: Date | null) => date !== null && date.getTime() < now;

    await prisma.task.create({
      data: {
        ...task,
        completed: steps.length > 0 && steps.every((step) => isPast(step.dueDate)),
        steps: {
          create: steps.map((step) => ({ ...step, completed: isPast(step.dueDate) })),
        },
      },
    });
  }

  console.log(`Seeded ${tasks.length} tasks.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());