# API Reference: use-tabs.ts

**Language**: TypeScript

**Source**: `packages/effects/hooks/src/use-tabs.ts`

---

## Functions

### useTabs()

**Returns**: (none)



### closeLeftTabs(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### closeAllTabs()

**Async function**

**Returns**: (none)



### closeRightTabs(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### closeOtherTabs(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### closeCurrentTab(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### pinTab(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### unpinTab(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### toggleTabPin(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### refreshTab(name?: string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name? | string | - | - |

**Returns**: (none)



### openTabInNewWindow(tab?: RouteLocationNormalized)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab? | RouteLocationNormalized | - | - |

**Returns**: (none)



### closeTabByKey(key: string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| key | string | - | - |

**Returns**: (none)



### setTabTitle(title: ComputedRef<string> | string)

**Async function**

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | ComputedRef<string> | string | - | - |

**Returns**: (none)



### resetTabTitle()

**Async function**

**Returns**: (none)



### getTabDisableState(tab: RouteLocationNormalized = route)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tab | RouteLocationNormalized | route | - |

**Returns**: (none)


