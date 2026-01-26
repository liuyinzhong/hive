import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { uniqueByKey } from '~/utils/arrayExtendApi';
import { mockUserData } from '~/api/system/user/list';
import { mockProjectData } from '../project/list';
import { mockModuleData } from '../module/list';
import { mockVersionData } from '../versions/list';
import { mockStoryData } from '../story/list';
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

    /* 从需求表里取当前项目的需求 */
    let storyList: any = mockStoryData.filter(
      (item) =>
        item.projectId === projectInfo.projectId &&
        item.versionId === versionInfo.versionId,
    );
    /* 随机从需求表里取一个需求 */
    let storyInfo: any = {};
    if (storyList.length) {
      storyInfo = faker.helpers.arrayElement(storyList);
    }

    let userInfo = faker.helpers.arrayElement(mockUserData);

    const dataItem: Record<string, any> = {
      bugId: faker.string.uuid(),
      bugTitle: faker.lorem.sentence(),
      bugNum: 1000 + i,
      bugRichText: faker.lorem.paragraph(),
      bugStatus: faker.helpers.arrayElement(['0', '10', '20', '30', '99']),
      bugLevel: faker.helpers.arrayElement(['0', '1', '2', '3', '4']),
      bugConfirmStatus: faker.helpers.arrayElement([0, 1]),
      bugEnv: faker.helpers.arrayElement(['0', '1', '2']),
      bugSource: faker.helpers.arrayElement([
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
      ]),
      bugType: faker.helpers.arrayElement([
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
      ]),
      bugUa: faker.internet.userAgent(),

      userId: userInfo.userId,
      avatar: userInfo.avatar,
      realName: userInfo.realName,
      creatorName: userInfo.realName,
      creatorId: userInfo.userId,
      versionId: versionInfo?.versionId || null,
      version: versionInfo?.version || null,
      moduleId: moduleInfo?.moduleId || null,
      moduleTitle: moduleInfo?.moduleTitle || null,
      projectId: projectInfo.projectId,
      projectTitle: projectInfo.projectTitle,
      storyId: storyInfo?.storyId || null,
      storyTitle: storyInfo?.storyTitle || null,
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

export const mockBugData = generateMockDataList(10000);

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
    bugStatus,
    keyword,
    includeId,
  } = getQuery(event);

  let listData = structuredClone(mockBugData);

  if (keyword) {
    listData = listData.filter(
      (item) =>
        item.bugTitle.indexOf(keyword) > -1 ||
        item.bugNum.toString().indexOf(keyword) > -1,
    );
  }

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }
  if (versionId) {
    listData = listData.filter((item) => item.versionId === versionId);
  }
  if (bugStatus) {
    listData = listData.filter((item) => item.bugStatus === bugStatus);
  }

  let defaultObj: any = {};
  if (includeId) {
    defaultObj = listData.find((item) => item.bugId === includeId) || {};
  }

  if (JSON.stringify(defaultObj) !== '{}') {
    listData.unshift(defaultObj);
  }

  /* 分页响应 */
  return usePageResponseSuccess(
    page as string,
    pageSize as string,
    uniqueByKey(listData, 'bugId'),
  );

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
