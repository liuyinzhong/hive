import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

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
    const dataItem: Record<string, any> = {
      userId: faker.string.uuid(),
      avatar: 'https://picsum.photos/100/100',
      username: faker.phone.number(),
      realName: faker.person.fullName(),
      desc: faker.lorem.word(),
      password: faker.internet.password(),
      disabled: faker.helpers.arrayElement([0, 1]),
      lastLoginIp: faker.internet.ip(),
      lastLoginDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
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

export const mockData = generateMockDataList(10);

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
    disabled,
  } = getQuery(event);

  let listData = structuredClone(mockData);
  if (username) {
    listData = listData.filter((item) => item.username.includes(username));
  }
  if (realName) {
    listData = listData.filter((item) => item.realName.includes(realName));
  }
  if (['0', '1'].includes(disabled as string)) {
    listData = listData.filter((item) => item.disabled === Number(disabled));
  }

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
