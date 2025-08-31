import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Default Tenant",
    },
  });

  console.log("Tenant created:", tenant);
  console.log("Tenant ID:", tenant.id);
}

main().finally(() => prisma.$disconnect());
