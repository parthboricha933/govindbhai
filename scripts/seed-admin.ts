import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const exists = await db.adminUser.findUnique({ where: { username: 'admin' } })
  if (!exists) {
    await db.adminUser.create({ data: { username: 'admin', password: 'admin123' } })
    console.log('Created default admin: admin / admin123')
  } else {
    console.log('Admin already exists')
  }
}
main().finally(() => db.$disconnect())
