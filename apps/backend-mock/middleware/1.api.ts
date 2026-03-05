import { defineEventHandler } from 'h3';
import { forbiddenResponse, sleep } from '~/utils/response';

/* 
Nitro 会 自动加载 middleware/ 目录下的所有文件作为全局中间件，按文件名排序执行。

- 1.api.ts - 第一个执行
- 2.xxx.ts - 第二个执行
*/

/* 演示环境，需要拦截的 API 前缀 */
const apiPrefixes = ['/api/system/', '/api/dev/'];

export default defineEventHandler(async (event) => {
  event.node.res.setHeader(
    'Access-Control-Allow-Origin',
    event.headers.get('Origin') ?? '*',
  );
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.statusMessage = 'No Content.';
    return 'OK';
  } else if (
    ['DELETE', 'PATCH', 'POST', 'PUT'].includes(event.method) &&
    apiPrefixes.some((prefix) => event.path.startsWith(prefix))
  ) {
    await sleep(Math.floor(Math.random() * 2000));
    return forbiddenResponse(event, '演示环境，禁止修改');
  }
});
