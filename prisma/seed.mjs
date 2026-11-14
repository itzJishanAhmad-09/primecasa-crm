import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new pkg.PrismaClient();

const email = process.env.SEED_ADMIN_EMAIL || 'admin@theprimecasa.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
await prisma.user.upsert({
  where: { email },
  update: {},
  create: { name: 'Admin', email, passwordHash: await bcrypt.hash(password, 10), role: 'ADMIN' },
});
if ((await prisma.property.count()) === 0) {
  await prisma.property.createMany({ data: [
    { name: 'Prime Heights, Indirapuram', type: '2 & 3 BHK flats', priceRange: '₹55 L – ₹95 L', units: 120 },
    { name: 'Casa Greens, Noida Ext.', type: 'Plots & 2 BHK', priceRange: '₹40 L – ₹70 L', units: 80 },
  ] });
}
console.log('Seeded. Admin login:', email);
await prisma.$disconnect();
