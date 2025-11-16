#!/usr/bin/env node
/**
 * 一次性修复脚本 - 将指定用户设置为管理员
 * One-time fix script - Set user as admin
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const email = process.argv[2] || 'ljasperp@gmail.com'

async function main() {
  console.log(`正在修复用户: ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isAdmin: true, status: true }
  })

  if (!user) {
    console.error(`❌ 未找到用户: ${email}`)
    process.exit(1)
  }

  console.log('修复前:', user)

  const updated = await prisma.user.update({
    where: { email },
    data: { isAdmin: true, status: 'ACTIVE' }
  })

  console.log('修复后:', updated)
  console.log('✅ 用户已成功设置为管理员!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
