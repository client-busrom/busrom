/**
 * 临时修复端点 - 将第一个用户设置为管理员
 * Temporary fix endpoint - Set first user as admin
 *
 * 访问 /api/fix-admin-user 来修复
 * Access /api/fix-admin-user to fix
 */

import type { Request, Response } from 'express'

export async function fixAdminUserHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context

    // 获取第一个创建的用户
    const users = await context.sudo().query.User.findMany({
      orderBy: { createdAt: 'asc' },
      take: 1,
      query: 'id name email isAdmin status createdAt'
    })

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到用户'
      })
    }

    const user = users[0]
    console.log('修复前:', user)

    // 更新用户为管理员
    const updated = await context.sudo().query.User.updateOne({
      where: { id: user.id },
      data: {
        isAdmin: true,
        status: 'ACTIVE'
      },
      query: 'id name email isAdmin status'
    })

    console.log('修复后:', updated)

    res.json({
      success: true,
      message: '用户已成功设置为管理员!',
      before: user,
      after: updated
    })
  } catch (error: any) {
    console.error('修复用户失败:', error)
    res.status(500).json({
      success: false,
      message: '修复失败',
      error: error.message
    })
  }
}
