import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

  // Create a default tenant
  const tenant = await prisma.tenant.create({
    data: { name: process.env.PRISMA_TENANT_NAME || "Default Tenant" },
  });

  // Create an admin user for that tenant
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: process.env.PRISMA_ADMIN_EMAIL || "admin@example.com",
      name: process.env.PRISMA_ADMIN_USERNAME || "admin",
      role: "admin",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
