import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run admin:promote -- user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: {
      email
    },
    data: {
      role: "ADMIN"
    },
    select: {
      email: true,
      role: true
    }
  });

  console.log(`Updated ${user.email} to ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
