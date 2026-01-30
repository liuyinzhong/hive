import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { uniqueByKey } from '~/utils/arrayExtendApi';
import { mockUserData } from '~/api/system/user/list';
import { mockProjectData } from '../project/list';
import { mockModuleData } from '../module/list';
import { mockVersionData } from '../versions/list';
const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    /* 随机从项目表中取一个项目 */
    let projectInfo: any = faker.helpers.arrayElement(mockProjectData);

    /* 从版本表中取当前项目的版本 */
    let versionList: any = mockVersionData.filter(
      (item) => item.projectId === projectInfo.projectId,
    );
    /* 随机从版本表中取一个版本 */
    let versionInfo: any = {};
    if (versionList.length) {
      versionInfo = faker.helpers.arrayElement(versionList);
    }

    /* 从模块表中取当前项目的模块 */
    let moduleList: any = mockModuleData.filter(
      (item) => item.projectId === projectInfo.projectId,
    );
    /* 随机从模块表中取一个模块 */
    let moduleInfo: any = {};
    if (moduleList.length) {
      moduleInfo = faker.helpers.arrayElement(moduleList);
    }

    const dataItem: Record<string, any> = {
      storyId: faker.string.uuid(),
      pid: null,
      storyTitle: faker.lorem.sentence(),
      storyNum: 1000 + i,
      creatorName: faker.person.fullName(),
      creatorId: faker.string.uuid(),
      storyRichText: faker.lorem.paragraph(),
      files:
        'https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp',
      storyType: faker.helpers.arrayElement([
        0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
      ]),
      storyStatus: faker.helpers.arrayElement([0, 10, 20, 30, 31, 99]),
      storyLevel: faker.helpers.arrayElement([0, 10, 20]),
      versionId: versionInfo?.versionId || null,
      version: versionInfo?.version || null,
      projectId: projectInfo?.projectId || null,
      projectTitle: projectInfo?.projectTitle || null,
      moduleId: moduleInfo?.moduleId || null,
      moduleTitle: moduleInfo?.moduleTitle || null,
      source: faker.helpers.arrayElement([0, 10]),
      updateDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      /* 关联用户列表，使用 faker 随机 1~5个值 */
      userList: faker.helpers.arrayElements(
        mockUserData
          .filter((item) => item.disabled === 0)
          .map((item) => ({
            userId: item.userId,
            avatar: item.avatar,
            realName: item.realName,
          })),
        faker.number.int({ min: 1, max: 5 }),
      ),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockStoryData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    page = 1,
    pageSize = 20,
    projectId,
    versionId,
    storyStatus,
    keyword,
    includeId,
  } = getQuery(event);

  let listData = structuredClone(mockStoryData);

  if (keyword) {
    listData = listData.filter(
      (item) =>
        item.storyTitle.indexOf(keyword) > -1 ||
        item.storyNum.toString().indexOf(keyword) > -1,
    );
  }

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }
  if (versionId) {
    listData = listData.filter((item) => item.versionId === versionId);
  }
  if (storyStatus) {
    listData = listData.filter((item) => item.storyStatus === storyStatus);
  }

  let defaultObj: any = {};
  if (includeId) {
    defaultObj = listData.find((item) => item.storyId === includeId) || {};
  }

  if (JSON.stringify(defaultObj) !== '{}') {
    listData.unshift(defaultObj);
  }

  /* 分页响应 */
  return usePageResponseSuccess(
    page as string,
    pageSize as string,
    uniqueByKey(listData, 'storyId'),
  );

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
