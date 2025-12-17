import { MOCK_API_UserData } from './table-data2';
import { sleep } from '#/utils/index';

export namespace DemoTableApi {
  export interface PageFetchParams {
    [key: string]: any;
    page: number;
    pageSize: number;
  }
}

/**
 * 获取示例表格数据
 */
async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  return new Promise<{ items: any; total: number }>((resolve) => {
    const { page, pageSize } = params;
    const items = MOCK_API_UserData.slice(
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
