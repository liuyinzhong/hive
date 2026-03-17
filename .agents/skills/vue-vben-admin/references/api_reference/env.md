# API Reference: env.ts

**Language**: TypeScript

**Source**: `internal/vite-config/src/utils/env.ts`

---

## Functions

### getConfFiles()

**Returns**: (none)



### loadAndConvertEnv(match = 'VITE_', confFiles = getConfFiles()

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| match | None | 'VITE_' | - |
| confFiles | None | getConfFiles( | - |

**Returns**: (none)



### getBoolean(value: string | undefined)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | string | undefined | - | - |

**Returns**: (none)



### getString(value: string | undefined, fallback: string)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | string | undefined | - | - |
| fallback | string | - | - |

**Returns**: (none)



### getNumber(value: string | undefined, fallback: number)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | string | undefined | - | - |
| fallback | number | - | - |

**Returns**: (none)


