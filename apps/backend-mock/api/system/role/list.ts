import { faker } from '@faker-js/faker';
import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_MENU_LIST_V2 } from '~/api/menu/menuJSON';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export const mockRoleData = [
  {
    id: '458e8285-cd9e-48ca-ac78-d2178a0e8c4f',
    name: 'SuperAdmin',
    status: 1,
    createDate: null,
    permissions: MOCK_MENU_LIST_V2.map((item) => item.id),
    remark: '超级管理员，普通人不要给这个',
  },
  {
    id: '6b81f1cf-301a-444f-a5b4-2ffa333de39f',
    name: 'Admin',
    status: 1,
    createDate: null,
    permissions: [
      // 工作台
      '205ce73c-baa0-4df9-b853-f6ae810d38ef',
      '7c17031e-63fd-4f5d-8c00-17d85673457c',
      '45843bfc-4e97-4061-87cb-7e4835100d43',
      // 开发管理
      'f9d7d286-4a01-48dd-a503-eda000103a4a',
      '877eb221-31fd-4d46-8c6d-03d667b62dcd',
      '383afd6b-6090-4dce-b7d8-7f0df0ebb225',
      '1be595c3-dc09-49dc-a468-f2eea965aa12',
      '3e35239c-a181-4963-a368-e2cd23e0b734',
      '22ce1ac1-eb8e-4238-8a8d-e0c736156508',
      'f503e83d-479c-4377-bf4e-07306f97f20c',
      'e2f3e82a-7b16-4cb3-b3c0-a29502f18ae7',
      'ffa185fa-4070-4a98-ae35-6e98b5eadec2',

      // 系统管理
      '4d7223d8-a14d-4dec-9063-1e111d208278',
      '382dc7b6-de8d-45bc-834b-fee9c19cae32',
      'd4abd481-5e86-4a1c-b91c-6c6b821c00bb',
      '8d9c1f40-549e-4de3-8322-dc15417ff00a',
      'c6a12e2a-30cf-47cf-a407-17baf6269abf',
      '49bd2e37-8544-487c-a17f-27d122ffe092',
    ],
    remark: '管理员，一般用户不要给这个',
  },
  {
    id: '2d0058c0-6347-4b73-92fa-c1b12f5e6454',
    name: 'user',
    status: 1,
    createDate: null,
    permissions: [
      // 工作台
      '205ce73c-baa0-4df9-b853-f6ae810d38ef',
      '45843bfc-4e97-4061-87cb-7e4835100d43',
      '7c17031e-63fd-4f5d-8c00-17d85673457c',
      // 开发管理
      'f9d7d286-4a01-48dd-a503-eda000103a4a',
      '383afd6b-6090-4dce-b7d8-7f0df0ebb225',
      '1be595c3-dc09-49dc-a468-f2eea965aa12',
      '3e35239c-a181-4963-a368-e2cd23e0b734',
      '22ce1ac1-eb8e-4238-8a8d-e0c736156508',
      'f503e83d-479c-4377-bf4e-07306f97f20c',
      'e2f3e82a-7b16-4cb3-b3c0-a29502f18ae7',
      'ffa185fa-4070-4a98-ae35-6e98b5eadec2',
      // 流程管理
      '975030a3-c34c-4ed4-a500-52fe6b08eb3d',
      '42a00658-be1e-4ed5-8e1d-93c7a4f75b64',
      'd1de0ae8-6ce4-45dd-bd9b-2d58740da66c',
    ],
    remark: '普通用户',
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
    name,
    id,
    remark,
    startDate,
    endDate,
    status,
  } = getQuery(event);
  let listData = structuredClone(mockRoleData);
  if (name) {
    listData = listData.filter((item) =>
      item.name.toLowerCase().includes(String(name).toLowerCase()),
    );
  }
  if (id) {
    listData = listData.filter((item) =>
      item.id.toLowerCase().includes(String(id).toLowerCase()),
    );
  }
  if (remark) {
    listData = listData.filter((item) =>
      item.remark?.toLowerCase()?.includes(String(remark).toLowerCase()),
    );
  }
  if (startDate) {
    listData = listData.filter((item) => item.createDate >= startDate);
  }
  if (endDate) {
    listData = listData.filter((item) => item.createDate <= endDate);
  }
  if (['0', '1'].includes(status as string)) {
    listData = listData.filter((item) => item.status === Number(status));
  }
  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
