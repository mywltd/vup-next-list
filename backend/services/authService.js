import bcrypt from 'bcrypt';
import { db } from '../db/init.js';

export class AuthService {
  // 管理员登录
  static async login(username, password) {
    const stmt = db.prepare('SELECT * FROM admin WHERE username = ?');
    const admin = stmt.get(username);

    if (!admin) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    return {
      id: admin.id,
      username: admin.username
    };
  }

  // 修改密码
  static async changePassword(adminId, oldPassword, newPassword) {
    const stmt = db.prepare('SELECT * FROM admin WHERE id = ?');
    const admin = stmt.get(adminId);

    if (!admin) {
      throw new Error('管理员不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!isValid) {
      throw new Error('原密码错误');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const updateStmt = db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?');
    updateStmt.run(newPasswordHash, adminId);

    return { success: true, message: '密码修改成功' };
  }
}

