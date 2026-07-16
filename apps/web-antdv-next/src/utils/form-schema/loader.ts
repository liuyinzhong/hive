import type { VbenFormSchema } from '#/adapter/form';

import { getFormSchemaDetailApi } from '#/api/form';

import { compileVbenFormSchema } from './compiler';
import { getFormSchemaWrapperClass, normalizeFormSchemaLayout } from './layout';

/** 按后台表单 Schema ID 加载并编译为原生 Vben Form Schema。 */
export async function loadVbenFormSchema(formSchemaId: string) {
  const record = await getFormSchemaDetailApi(formSchemaId);
  const layout = normalizeFormSchemaLayout(record.layout);
  return {
    layout,
    schema: compileVbenFormSchema(record.schema) as VbenFormSchema[],
    wrapperClass: getFormSchemaWrapperClass(layout),
  };
}
