import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

import { mockProjectData } from '../project/list';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

let projectIds = mockProjectData.map((item) => item.projectId);

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem: Record<string, any> = {
      moduleId: faker.string.uuid(),
      moduleTitle: faker.helpers.arrayElement([
        '医生端',
        '患者端',
        'EXE端',
        '商户管理端',
        '平台管理端',
        '药店端',
      ]),
      pid: null,
      projectId: faker.helpers.arrayElement(projectIds),
      sort: i,
      creatorId: faker.lorem.word(),
      creatorName: faker.person.fullName(),
      updateDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockData = generateMockDataList(20);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockData);

  const { projectId } = getQuery(event);

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }

  /* 分页响应 */
  // return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  return useResponseSuccess(listData);
});
