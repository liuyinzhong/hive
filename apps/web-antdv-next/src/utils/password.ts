import { z } from '#/adapter/form';

/**
 * 密码强度规则：长度 8~72 位，且至少包含小写字母、大写字母、数字、特殊字符中的两类。
 * 与后端 utils.ValidatePassword 保持一致；72 字节上限由后端另行校验。
 */
export const passwordSchema = z
  .string({ error: '请输入密码' })
  .min(8, { message: '密码长度不能少于 8 位' })
  .max(72, { message: '密码长度不能超过 72 位' })
  .refine((value) => countCharClasses(value) >= 2, {
    message: '密码须至少包含字母、数字、特殊字符中的两类',
  });

/** 统计字符串命中的字符类别数：小写字母、大写字母、数字、特殊字符 */
function countCharClasses(value: string): number {
  let classes = 0;
  if (/[a-z]/.test(value)) {
    classes += 1;
  }
  if (/[A-Z]/.test(value)) {
    classes += 1;
  }
  if (/\d/.test(value)) {
    classes += 1;
  }
  if (/[^a-zA-Z\d]/.test(value)) {
    classes += 1;
  }
  return classes;
}
