import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "local@journal.local" },
    create: { email: "local@journal.local", name: "Journal" },
    update: {},
  });

  const entryPrice = 21432.5;
  const exitPrice = 21458.75;
  const stopPrice = 21418.0;
  const size = 2;
  const fees = 4.5;
  const pointValue = 2;
  const pnl = (exitPrice - entryPrice) * size * pointValue - fees;
  const risk = entryPrice - stopPrice;
  const rValue = risk > 0 ? (exitPrice - entryPrice) / risk : null;
  const now = new Date();

  const trade = await prisma.tradeLog.create({
    data: {
      userId: user.id,
      symbol: "MNQ",
      direction: "LONG",
      instrumentType: "MNQ",
      pointValue,
      entryPrice,
      exitPrice,
      stopPrice,
      rValue,
      size,
      fees,
      pnl,
      session: "New York",
      entryTime: now,
      notes: "Random seed trade — London open pullback, held to target.",
      date: now,
      tags: ["seed", "base-hit"],
      images: [],
    },
  });

  console.log(JSON.stringify({ ok: true, tradeId: trade.id, pnl: trade.pnl }));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: String(error) }));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
