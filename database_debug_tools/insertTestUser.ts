import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      tenantId: "5621a2ca-70b3-46c0-b0db-b7f40bb8d3e5", //insert your own tenant id here, this will change when you create a new docker container with a fresh postgres instance
      email: "smitty@smallbizmcp.com",
      name: "Smitty Werbenjagermanjensen",
      role: "admin",
    },
  });

  console.log("User created:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
