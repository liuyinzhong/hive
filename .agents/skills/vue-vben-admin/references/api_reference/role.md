# API Reference: role.ts

**Language**: TypeScript

**Source**: `playground/src/api/system/role.ts`

---

## Functions

### getRoleList(params: Recordable<any>)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| params | Recordable<any> | - | - |

**Returns**: (none)



### createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| data | Omit<SystemRoleApi.SystemRole | - | - |
| 'id'> | None | - | - |

**Returns**: (none)



### updateRole(id: string, data: Omit<SystemRoleApi.SystemRole, 'id'>)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | - |
| data | Omit<SystemRoleApi.SystemRole | - | - |
| 'id'> | None | - | - |

**Returns**: (none)



### deleteRole(id: string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | - |

**Returns**: (none)


