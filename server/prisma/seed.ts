import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a dummy user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  // 2. Create a dummy project (or clear and recreate)
  await prisma.project.deleteMany();
  
  const project = await prisma.project.create({
    data: {
      id: '1',
      name: 'Web Dev Coursework',
      description: 'Build a full-stack web app with user auth',
      teams: {
        create: {
          userId: user.id,
          role: 'ADMIN',
        },
      },
      tasks: {
        create: [
          {
            title: 'Design database schema',
            description: 'Create the initial ER diagram',
            status: 'BACKLOG',
            position: 1000,
            assignedTo: user.id,
          },
          {
            title: 'Setup React project',
            description: 'Vite + React + Tailwind setup',
            status: 'TODO',
            position: 1000,
            assignedTo: user.id,
          },
          {
            title: 'Configure ESLint/Prettier',
            status: 'TODO',
            position: 2000,
          },
          {
            title: 'Build Authentication',
            description: 'JWT login and registration',
            status: 'IN_PROGRESS',
            position: 1000,
            assignedTo: user.id,
            dueDate: new Date(Date.now() + 86400000 * 3), // due in 3 days
          },
          {
            title: 'Initialize repository',
            status: 'DONE',
            position: 1000,
            assignedTo: user.id,
          },
        ],
      },
    },
  });

  console.log(`Seeded project: ${project.name} with 5 tasks`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
