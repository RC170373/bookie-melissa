import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENTS } from '../lib/achievements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding achievements...');

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        tier: achievement.tier,
        requirement: achievement.requirement,
        points: achievement.points,
      },
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

