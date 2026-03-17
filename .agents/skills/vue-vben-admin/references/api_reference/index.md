# API Reference: index.ts

**Language**: TypeScript

**Source**: `scripts/vsh/src/publint/index.ts`

---

## Functions

### getLintFiles(files: string[] = [])

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| files | string[] | [] | - |

**Returns**: (none)



### getCacheFile()

**Returns**: (none)



### readCache(cacheFile: string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cacheFile | string | - | - |

**Returns**: (none)



### runPublint(files: string[], { check }: PubLintCommandOptions)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| files | string[] | - | - |
| { check } | PubLintCommandOptions | - | - |

**Returns**: (none)



### printResult(results: Array<null | {
    pkgJson: Record<string, number | string>;
    pkgPath: string;
    publintResult: Result;
  }>, check?: boolean)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| results | Array<null | {
    pkgJson: Record<string | - | - |
| number | string>;
    pkgPath | string;
    publintResult: Result;
  }> | - | - |
| check? | boolean | - | - |

**Returns**: (none)



### definePubLintCommand(cac: CAC)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cac | CAC | - | - |

**Returns**: (none)


