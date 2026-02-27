import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('Password123!');

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash
    }
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash
    }
  });

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await prisma.task.createMany({
    data: [
      {
        userId: alice.id,
        title: 'Finish onboarding checklist',
        description: 'Complete initial setup and read documentation.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(now.getTime() + 3 * day)
      },
      {
        userId: alice.id,
        title: 'Plan sprint backlog',
        description: 'Coordinate with team to select tasks for sprint.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 5 * day)
      },
      {
        userId: alice.id,
        title: 'Close completed tasks',
        description: 'Review and close tasks from last sprint.',
        status: 'done',
        priority: 'low',
        completedAt: new Date(now.getTime() - 2 * day)
      },
      {
        userId: bob.id,
        title: 'Prepare weekly status update',
        description: 'Summarize progress and blockers.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 2 * day)
      },
      {
        userId: bob.id,
        title: 'Refactor authentication flow',
        description: 'Improve auth middleware and token handling.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now.getTime() + 7 * day)
      },
      {
        userId: bob.id,
        title: 'Update README documentation',
        description: 'Add usage details and API docs.',
        status: 'done',
        priority: 'low',
        completedAt: new Date(now.getTime() - 6 * day)
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
