# API Reference: generate-routes-frontend.ts

**Language**: TypeScript

**Source**: `packages/utils/src/helpers/generate-routes-frontend.ts`

---

## Functions

### generateRoutesByFrontend(routes: RouteRecordRaw[], roles: string[], forbiddenComponent?: RouteRecordRaw['component'])

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| routes | RouteRecordRaw[] | - | - |
| roles | string[] | - | - |
| forbiddenComponent? | RouteRecordRaw['component'] | - | - |

**Returns**: (none)



### hasAuthority(route: RouteRecordRaw, access: string[])

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| route | RouteRecordRaw | - | - |
| access | string[] | - | - |

**Returns**: (none)



### menuHasVisibleWithForbidden(route: RouteRecordRaw)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| route | RouteRecordRaw | - | - |

**Returns**: (none)


