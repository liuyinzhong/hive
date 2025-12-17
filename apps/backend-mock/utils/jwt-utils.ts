import type { EventHandlerRequest, H3Event } from 'h3';

import type { UserInfo } from './mock-data';

import { getHeader } from 'h3';
import jwt from 'jsonwebtoken';

import { MOCK_USERS } from './mock-data';

// TODO: Replace with your own secret key
const ACCESS_TOKEN_SECRET = 'access_token_secret';
const REFRESH_TOKEN_SECRET = 'refresh_token_secret';

export interface UserPayload extends UserInfo {
  iat: number;
  exp: number;
}

export function generateAccessToken(user: UserInfo) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

export function generateRefreshToken(user: UserInfo) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(
  event: H3Event<EventHandlerRequest>,
): null | Omit<UserInfo, 'password'> {
  const authHeader = getHeader(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer')) {
    return null;
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2) {
    return null;
  }
  const token = tokenParts[1] as string;
  try {
    const decoded = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET,
    ) as unknown as UserPayload;

    const username = decoded.username;
    const user = MOCK_USERS.find((item) => item.username === username);
    if (!user) {
      return null;
    }
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(
  token: string,
): null | Omit<UserInfo, 'password'> {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
    const username = decoded.username;
    const user = MOCK_USERS.find(
      (item) => item.username === username,
    ) as UserInfo;
    if (!user) {
      return null;
    }
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}

/**
 * 比较两个版本号
 * @param v1 版本号1（格式：x.y.z...）
 * @param v2 版本号2（格式：x.y.z...）
 * @returns 1: v1 > v2, -1: v1 < v2, 0: 相等
 * console.log(compareVersion('1.11.0', '1.9.9')); // 1
 * console.log(compareVersion('1.9.9', '1.11.0')); // -1
 * console.log(compareVersion('1.0.0', '1.0.0')); // 0
 * console.log(compareVersion('2.0', '2.0.0')); // 0
 * console.log(compareVersion('1.0.1', '1.0.0')); // 1
 */
export function compareVersion(v1: string, v2: string): number {
  const v1Parts = v1.split('.');
  const v2Parts = v2.split('.');
  const len = Math.max(v1Parts.length, v2Parts.length);

  // 填充较短的版本号，确保长度一致
  while (v1Parts.length < len) {
    v1Parts.push('0');
  }
  while (v2Parts.length < len) {
    v2Parts.push('0');
  }

  // 逐段比较版本号
  for (let i = 0; i < len; i++) {
    const num1 = Number.parseInt(v1Parts[i]!, 10);
    const num2 = Number.parseInt(v2Parts[i]!, 10);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}
