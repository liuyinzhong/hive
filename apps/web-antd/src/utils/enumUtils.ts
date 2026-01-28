/**
 * 通用枚举转选项数组函数
 * @param enumObj 任意数字枚举（如 TaskStatusEnum、TaskType）
 * @param options 自定义字段配置
 * @param options.labelField label字段名，默认 'label'
 * @param options.valueField value字段名，默认 'value'
 * @returns 格式化后的选项数组
 */
export function enumToOptions(enumObj: any, options: {
  labelField?: string;
  valueField?: string;
} = {}): Array<{
  [key: string]: any;
}> {
  const {
    labelField = 'label',
    valueField = 'value'
  } = options;

  return Object.entries(enumObj)
    .filter(([key]) => isNaN(Number(key)))
    .map(([label, value]) => ({
      [labelField]: label,
      [valueField]: value
    }));
}
