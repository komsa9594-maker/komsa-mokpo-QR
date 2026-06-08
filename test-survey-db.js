const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'passenger_survey';
    `;
    console.log("Table check result:", JSON.stringify(result));
  } catch (e) {
    console.error("Database query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
