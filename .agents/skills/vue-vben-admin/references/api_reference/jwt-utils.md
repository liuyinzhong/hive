# API Reference: jwt-utils.ts

**Language**: TypeScript

**Source**: `apps/backend-mock/utils/jwt-utils.ts`

---

## Functions

### generateAccessToken(user: UserInfo)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| user | UserInfo | - | - |

**Returns**: (none)



### generateRefreshToken(user: UserInfo)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| user | UserInfo | - | - |

**Returns**: (none)



### verifyAccessToken(event: H3Event<EventHandlerRequest>)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| event | H3Event<EventHandlerRequest> | - | - |

**Returns**: (none)



### verifyRefreshToken(token: string)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| token | string | - | - |

**Returns**: (none)


