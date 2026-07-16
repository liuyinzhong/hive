type FormHandler = (...args: unknown[]) => unknown;

const dataSources = new Map<string, FormHandler>();
const formatters = new Map<string, FormHandler>();
const handlers = new Map<string, FormHandler>();
const renderers = new Map<string, FormHandler>();

function register(
  registry: Map<string, FormHandler>,
  key: string,
  handler: FormHandler,
) {
  if (!key.trim()) throw new Error('表单注册键不能为空');
  registry.set(key, handler);
}

export function registerFormDataSource(key: string, handler: FormHandler) {
  register(dataSources, key, handler);
}

export function registerFormFormatter(key: string, handler: FormHandler) {
  register(formatters, key, handler);
}

export function registerFormHandler(key: string, handler: FormHandler) {
  register(handlers, key, handler);
}

export function registerFormRenderer(key: string, handler: FormHandler) {
  register(renderers, key, handler);
}

export function resolveFormDataSource(key: string) {
  return dataSources.get(key);
}

export function resolveFormFormatter(key: string) {
  return formatters.get(key);
}

export function resolveFormHandler(key: string) {
  return handlers.get(key);
}

export function resolveFormRenderer(key: string) {
  return renderers.get(key);
}
