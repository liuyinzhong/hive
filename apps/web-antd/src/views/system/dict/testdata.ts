import type { DictFace } from '#/dicts';
import { faker } from '@faker-js/faker';

export const getTestData = (
  pageSize: number,
  currentLevel: number = 1,
  maxLevel: number = 2,
) => {
  // 如果当前层级超过最大层级，返回空数组（没有子节点）
  if (currentLevel > maxLevel) {
    return [];
  }

  const data: DictFace[] = [];
  for (let i = 0; i < pageSize; i++) {
    const hasChildren =
      currentLevel < maxLevel && faker.datatype.boolean({ probability: 0.3 }); // 30%的概率有子节点

    data.push({
      id: faker.string.uuid(),
      pid: faker.helpers.arrayElement([null, faker.string.uuid()]), // pid 可以是 null（根节点）或随机UUID
      label: faker.commerce.department(),
      value: faker.commerce.department(),
      type: 'CHANGE_BEHAVIOR',
      disabled: faker.helpers.arrayElement([0, 1]),
      remark: faker.lorem.sentence(),
      color: faker.helpers.arrayElement([
        'processing',
        'default',
        'success',
        'error',
        'warning',
        'magenta',
        'red',
        'volcano',
        'orange',
        'gold',
        'lime',
        'green',
        'cyan',
        'blue',
        'geekblue',
        'purple',
      ]),
      // 只有当前层级小于最大层级时，才有可能有子节点
      children: hasChildren
        ? getTestData(
            faker.number.int({ min: 1, max: 3 }),
            currentLevel + 1,
            maxLevel,
          )
        : [],
      createDate: faker.date.recent().toLocaleString(),
    });
  }
  return data;
};
