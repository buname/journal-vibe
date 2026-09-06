import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const trades = await prisma.tradeLog.findMany({
    select: { id: true, userId: true, symbol: true, pnl: true },
  });
  console.log(JSON.stringify({ users, trades }, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
