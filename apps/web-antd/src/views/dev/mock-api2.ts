import { MOCK_API_StoryData } from './table-data2';

export namespace DemoTableApi {
  export interface PageFetchParams {
    [key: string]: any;
    page: number;
    pageSize: number;
  }
}

export function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

/**
 * 获取示例表格数据
 */
async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  return new Promise<{ items: any; total: number }>((resolve) => {
    const { page, pageSize } = params;
    const items = MOCK_API_StoryData.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    sleep(100).then(() => {
      resolve({
        total: items.length,
        items,
      });
    });
  });
}

export { getExampleTableApi };
