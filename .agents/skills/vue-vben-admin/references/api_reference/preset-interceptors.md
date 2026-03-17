# API Reference: preset-interceptors.ts

**Language**: TypeScript

**Source**: `packages/effects/request/src/request-client/preset-interceptors.ts`

---

## Functions

### defaultResponseInterceptor({
  codeField = 'code', dataField = 'data', successCode = 0, }: {
  /** 响应数据中代表访问结果的字段名 */
  codeField: string;
  /** 响应数据中装载实际数据的字段名，或者提供一个函数从响应数据中解析需要返回的数据 */
  dataField: ((response: any)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| {
  codeField | None | 'code' | - |
| dataField | None | 'data' | - |
| successCode | None | 0 | - |
| } | {
  /** 响应数据中代表访问结果的字段名 */
  codeField: string;
  /** 响应数据中装载实际数据的字段名，或者提供一个函数从响应数据中解析需要返回的数据 */
  dataField: ((response: any | - | - |

**Returns**: (none)



### authenticateResponseInterceptor({
  client, doReAuthenticate, doRefreshToken, enableRefreshToken, formatToken, }: {
  client: RequestClient;
  doReAuthenticate: ()

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| {
  client | None | - | - |
| doReAuthenticate | None | - | - |
| doRefreshToken | None | - | - |
| enableRefreshToken | None | - | - |
| formatToken | None | - | - |
| } | {
  client: RequestClient;
  doReAuthenticate: ( | - | - |

**Returns**: (none)


