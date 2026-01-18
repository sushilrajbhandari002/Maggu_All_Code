import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { User } from '../../models/User';
import type { LoginRequestBody, LoginResponse } from './auth.types';
import { HttpError } from '../../middleware/errorHandler';

export async function login(body: LoginRequestBody): Promise<LoginResponse> {
  const user = await User.findOne({
    where: { email: body.email, role: body.role },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  const responseUser: LoginResponse['user'] = {
    id: String(user.id),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone ?? undefined,
    address: user.address ?? undefined,
    image: user.image ?? undefined,
    username: user.username ?? undefined,
    teacherId: user.teacherId ?? undefined,
    classTeacherOf: user.classTeacherOf ?? undefined,
    assignedClasses: (user.assignedClasses as string[] | null) ?? undefined,
    class: user.class ?? undefined,
    rollNumber: user.rollNumber ?? undefined,
    needsPasswordChange: user.needsPasswordChange,
  };

  return { user: responseUser, token };
}

