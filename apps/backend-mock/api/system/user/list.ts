import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockDeptData } from '~/api/system/dept/list';

export interface UserInfo {
  userId: string;
  password: string;
  realName: string;
  roles?: string[];
  username: string;
  homePath?: string;
  [key: string]: any;
}

let deptIds = mockDeptData.map((item) => item.id);

export const mockUserData: UserInfo[] = [
  {
    userId: 'fd8b5f2c-77c6-4e59-b81c-306c2fb85d44',
    avatar: 'https://picsum.photos/100/100',
    username: 'vben',
    realName: 'Vben',
    roles: ['super'],
    roleIds: ['458e8285-cd9e-48ca-ac78-d2178a0e8c4f'],
    desc: '超管',
    email: 'vben@example.com',
    password: '123456',
    homePath: null,
    deptIds: faker.helpers.arrayElements(
      deptIds,
      faker.number.int({ min: 1, max: 5 }),
    ),
    status: 1,
    lastLoginIp: faker.internet.ip(),
    lastLoginDate: null,
    createDate: null,
    updateDate: null,
  },
  {
    userId: '68fd6081-f907-44a2-a309-4d856a3276e9',
    avatar: 'https://picsum.photos/100/100',
    username: 'admin',
    realName: 'Admin',
    roles: ['admin'],
    roleIds: ['6b81f1cf-301a-444f-a5b4-2ffa333de39f'],
    desc: '管理员',
    email: 'admin@example.com',
    password: '123456',
    homePath: null,
    deptIds: faker.helpers.arrayElements(
      deptIds,
      faker.number.int({ min: 1, max: 5 }),
    ),
    status: 1,
    lastLoginIp: faker.internet.ip(),
    lastLoginDate: null,
    createDate: null,
    updateDate: null,
  },
  {
    userId: '2d0058c0-6347-4b73-92fa-c1b12f5e6454',
    avatar: 'https://picsum.photos/100/100',
    username: 'jack',
    realName: 'Jack',
    roles: ['user'],
    roleIds: ['2d0058c0-6347-4b73-92fa-c1b12f5e6454'],
    desc: '普通用户',
    email: 'Jack@example.com',
    password: '123456',
    homePath: null,
    deptIds: faker.helpers.arrayElements(
      deptIds,
      faker.number.int({ min: 1, max: 5 }),
    ),
    status: 1,
    lastLoginIp: faker.internet.ip(),
    lastLoginDate: null,
    createDate: null,
    updateDate: null,
  },
];

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    page = 1,
    pageSize = 20,
    username,
    realName,
    status,
  } = getQuery(event);

  let listData = structuredClone(mockUserData);
  if (username) {
    listData = listData.filter((item) =>
      item.username.includes(username as string),
    );
  }
  if (realName) {
    listData = listData.filter((item) =>
      item.realName.includes(realName as string),
    );
  }
  if (['0', '1'].includes(status as string)) {
    listData = listData.filter((item) => item.status === Number(status));
  }

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
