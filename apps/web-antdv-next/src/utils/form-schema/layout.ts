import type { FormSchemaLayout } from './types';

export const DEFAULT_FORM_SCHEMA_LAYOUT: FormSchemaLayout = 'single';

export const FORM_SCHEMA_LAYOUT_CLASSES: Record<FormSchemaLayout, string> = {
  single: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
  double: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

export const FORM_SCHEMA_WRAPPER_CLASS =
  FORM_SCHEMA_LAYOUT_CLASSES[DEFAULT_FORM_SCHEMA_LAYOUT];

export function normalizeFormSchemaLayout(
  layout?: null | string,
): FormSchemaLayout {
  return layout === 'double' || layout === 'triple' ? layout : 'single';
}

export function getFormSchemaWrapperClass(layout?: null | string) {
  return FORM_SCHEMA_LAYOUT_CLASSES[normalizeFormSchemaLayout(layout)];
}
