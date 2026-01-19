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
      versionId: faker.string.uuid(),
      version: `1.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
      versionType: faker.helpers.arrayElement(['0', '10', '20']),
      remark: faker.lorem.sentence(),
      creatorId: faker.string.uuid(),
      creatorName: faker.person.fullName(),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      endDate: '',
      startDate: '',
      projectId: faker.helpers.arrayElement(projectIds),
      releaseStatus: faker.helpers.arrayElement(['0', '10', '20', '30']),
      releaseDate: '',
      changeLogRichText: faker.lorem.paragraph(),
      changeLog: faker.lorem.paragraph(),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockVersionData = generateMockDataList(20);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    page = 1,
    pageSize = 20,
    version,
    releaseStatus,
    projectId,
  } = getQuery(event);

  let listData = structuredClone(mockVersionData);
  if (version) {
    listData = listData.filter((item) => item.version === version);
  }
  if (releaseStatus) {
    listData = listData.filter((item) => item.releaseStatus === releaseStatus);
  }
  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }

  /* 以 version 排序,使用compareVersion */
  listData.sort((a, b) => compareVersion(b.version, a.version));

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
