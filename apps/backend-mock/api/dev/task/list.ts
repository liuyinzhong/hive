import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
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

    /* 随机从用户表中取一个用户 */
    let userInfo: any = faker.helpers.arrayElement(mockUserData);

    const dataItem: Record<string, any> = {
      taskId: faker.string.uuid(),
      pid: null,
      storyId: storyInfo?.storyId || null,
      storyTitle: storyInfo?.storyTitle || null,
      moduleId: moduleInfo?.moduleId || null,
      moduleTitle: moduleInfo?.moduleTitle || null,
      versionId: versionInfo?.versionId || null,
      version: versionInfo?.version || null,
      projectId: projectInfo?.projectId || null,
      projectTitle: projectInfo?.projectTitle || null,
      taskTitle: faker.lorem.sentence(),
      taskNum: 1000 + i,
      taskRichText: faker.lorem.paragraph(),
      taskStatus: faker.helpers.arrayElement(['0', '10', '99']),
      taskType: faker.helpers.arrayElement([
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
        '13',
        '14',
        '15',
      ]),
      planHours: faker.number.int({ min: 1, max: 10 }),
      actualHours: faker.number.int({ min: 1, max: 10 }),
      endDate: formatterCN.format(
        faker.date.between({ from: '2025-08-01', to: '2025-09-01' }),
      ),
      startDate: formatterCN.format(
        faker.date.between({ from: '2025-08-01', to: '2025-09-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2025-08-01', to: '2025-09-01' }),
      ),
      creatorId: userInfo.userId,
      creatorName: userInfo.realName,
      userId: userInfo.userId,
      realName: userInfo.realName,
      avatar: userInfo.avatar,
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockTaskData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockTaskData);

  const {
    page = 1,
    pageSize = 20,
    projectId,
    versionId,
    taskTitle,
    taskStatus,
  } = getQuery(event);

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }
  if (versionId) {
    listData = listData.filter((item) => item.versionId === versionId);
  }
  if (taskTitle) {
    listData = listData.filter((item) => item.taskTitle.includes(taskTitle));
  }
  if (taskStatus) {
    listData = listData.filter((item) => item.taskStatus === taskStatus);
  }

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
