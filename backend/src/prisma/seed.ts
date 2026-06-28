import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear database
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Existing database records cleared.');

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const user1Password = await bcrypt.hash('user123', 10);
  const user2Password = await bcrypt.hash('user123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@task.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@task.com',
      password: user1Password,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@task.com',
      password: user2Password,
      role: 'USER',
    },
  });

  console.log('👤 Seeded 3 users: 1 ADMIN, 2 USERS.');

  // 4. Create sample tasks
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.task.createMany({
    data: [
      {
        title: 'Review Project Guidelines',
        description: 'Review the architecture and rules for the task management system.',
        priority: 'HIGH',
        status: 'OPEN',
        dueDate: nextWeek,
        createdById: admin.id,
        assignedToId: user1.id,
      },
      {
        title: 'Configure DB Connection',
        description: 'Set up external MySQL connection and perform standard migration checks.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: tomorrow,
        createdById: admin.id,
        assignedToId: user2.id,
      },
      {
        title: 'Implement Auth Service',
        description: 'Complete JWT credentials flow, password encryption and validation checks.',
        priority: 'HIGH',
        status: 'TESTING',
        dueDate: nextWeek,
        createdById: user1.id,
        assignedToId: user2.id,
      },
      {
        title: 'Create Repository Abstractions',
        description: 'Isolate database calls from services using clean repository models.',
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: tomorrow,
        createdById: user2.id,
        assignedToId: admin.id,
      },
      {
        title: 'Design API Walkthrough',
        description: 'Prepare complete api verification logs and client examples.',
        priority: 'LOW',
        status: 'OPEN',
        dueDate: nextWeek,
        createdById: user1.id,
        assignedToId: null,
      },
    ],
  });

  console.log('📋 Seeded 5 sample tasks.');
  console.log('🌱 Seeding process finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
