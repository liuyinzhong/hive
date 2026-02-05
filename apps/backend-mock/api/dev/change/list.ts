import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockUserData } from '~/api/system/user/list';
import { mockBugData } from '~/api/dev/bug/list';
import { mockVersionData } from '~/api/dev/versions/list';
import { mockStoryData } from '~/api/dev/story/list';
import { mockTaskData } from '~/api/dev/task/list';
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

  /* 随机从用户表中取一个用户 */
  let userInfo: any = faker.helpers.arrayElement(
    mockUserData.filter((item) => item.disabled === 0),
  );

  for (let i = 0; i < count; i++) {
    let fkType: number = faker.helpers.arrayElement([0, 10, 20, 30]);

    let fkId: string = '';
    if (fkType === 0) {
      fkId = faker.helpers.arrayElement(mockStoryData).storyId;
    } else if (fkType === 10) {
      fkId = faker.helpers.arrayElement(mockTaskData).taskId;
    } else if (fkType === 20) {
      fkId = faker.helpers.arrayElement(mockBugData).bugId;
    } else if (fkType === 30) {
      fkId = faker.helpers.arrayElement(mockVersionData).versionId;
    }

    const dataItem: Record<string, any> = {
      changeId: faker.string.uuid(),
      changeType: faker.helpers.arrayElement([0, 10, 20, 30]),
      changeRichText: faker.lorem.paragraph(),
      creatorId: userInfo.userId,
      creatorName: userInfo.realName,
      fkId: fkId,
      fkType: fkType,
      extendJson: '',
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      updateDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockChangeData = generateMockDataList(8000);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockChangeData);

  const { fkType, fkId } = getQuery(event);
  if (fkType) {
    listData = listData.filter((item) => item.fkType === Number(fkType));
  }
  if (fkId) {
    listData = listData.filter((item) => item.fkId === fkId);
  }

  /* 全量响应 */
  return useResponseSuccess(listData);
});
