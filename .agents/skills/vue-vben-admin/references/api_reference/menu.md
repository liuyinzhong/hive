# API Reference: menu.ts

**Language**: TypeScript

**Source**: `playground/src/api/system/menu.ts`

---

## Functions

### getMenuList()

**Async function**

**Returns**: (none)



### isMenuNameExists(name: string, id?: SystemMenuApi.SystemMenu['id'])

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | string | - | - |
| id? | SystemMenuApi.SystemMenu['id'] | - | - |

**Returns**: (none)



### isMenuPathExists(path: string, id?: SystemMenuApi.SystemMenu['id'])

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| path | string | - | - |
| id? | SystemMenuApi.SystemMenu['id'] | - | - |

**Returns**: (none)



### createMenu(data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| data | Omit<SystemMenuApi.SystemMenu | - | - |
| 'children' | 'id'> | None | - | - |

**Returns**: (none)



### updateMenu(id: string, data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | - |
| data | Omit<SystemMenuApi.SystemMenu | - | - |
| 'children' | 'id'> | None | - | - |

**Returns**: (none)



### deleteMenu(id: string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | - |

**Returns**: (none)


