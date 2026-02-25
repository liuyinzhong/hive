import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { uniqueByKey } from '~/utils/arrayExtendApi';
import { mockProjectData } from '../project/list';

import { mockModuleData } from '../module/list';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

let projectIds = mockModuleData.map((item) => item.projectId);

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem: Record<string, any> = {
      versionId: faker.string.uuid(),
      version: `1.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
      versionType: faker.helpers.arrayElement([0, 10, 20]),
      remark: faker.lorem.sentence(),
      creatorId: faker.string.uuid(),
      creatorName: faker.person.fullName(),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      endDate: '',
      startDate: '',
      projectId: faker.helpers.arrayElement(projectIds),
      releaseStatus: faker.helpers.arrayElement([0, 10, 20, 30, 40]),
      releaseDate: '',
      changeLogRichText: faker.lorem.paragraph(),
      changeLog: faker.lorem.paragraph(),
    };
    // 版本号不能重复
    if (dataList.some((item) => item.version === dataItem.version)) {
      i--;
      continue;
    }
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockVersionData = generateMockDataList(100);

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
    includeId,
  } = getQuery(event);

  let listData = structuredClone(mockVersionData);

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }

  if (version) {
    listData = listData.filter((item) => item.version === version);
  }
  if (releaseStatus) {
    listData = listData.filter((item) => item.releaseStatus === releaseStatus);
  }

  /* 以 version 排序,使用compareVersion */
  listData.sort((a, b) => compareVersion(b.version, a.version));

  let defaultObj: any = {};
  if (includeId) {
    defaultObj = listData.find((item) => item.versionId === includeId) || {};
  }

  if (JSON.stringify(defaultObj) !== '{}') {
    listData.unshift(defaultObj);
  }

  if (page && pageSize) {
    /* 分页响应 */
    return usePageResponseSuccess(
      page as string,
      pageSize as string,
      uniqueByKey(listData, 'versionId'),
    );
  } else {
    /* 全量响应 */
    return useResponseSuccess(uniqueByKey(listData, 'versionId'));
  }
});
