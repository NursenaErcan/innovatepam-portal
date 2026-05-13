import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@innovatepam.local';
  const password = 'Admin123!';
  const role = 'admin';

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      hashedPassword,
      role,
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
