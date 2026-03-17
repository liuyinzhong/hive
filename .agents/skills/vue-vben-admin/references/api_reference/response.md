# API Reference: response.ts

**Language**: TypeScript

**Source**: `apps/backend-mock/utils/response.ts`

---

## Functions

### useResponseError(message: string, error: any = null)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| message | string | - | - |
| error | any | null | - |

**Returns**: (none)



### forbiddenResponse(event: H3Event<EventHandlerRequest>, message = 'Forbidden Exception')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| event | H3Event<EventHandlerRequest> | - | - |
| message | None | 'Forbidden Exception' | - |

**Returns**: (none)



### unAuthorizedResponse(event: H3Event<EventHandlerRequest>)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| event | H3Event<EventHandlerRequest> | - | - |

**Returns**: (none)



### sleep(ms: number)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| ms | number | - | - |

**Returns**: (none)


