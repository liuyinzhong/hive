/**
 * 版本更新类型枚举（明确支持的更新类型）字典值：VERSION_TYPE
 */
type VersionUpdateType = '0' | '10' | '20';

/**
 * 版本号组成部分接口
 */
interface VersionParts {
  major: number;
  minor: number;
  patch: number;
}

/**
 * 根据更新类型递增版本号
 * @param oldVersion 旧版本号（格式：x.y.z，x/y/z 为非负整数）
 * @param type 更新类型（版本升级/特性更新/修订补丁）
 * @returns 新的版本号
 * @throws 非法版本号或不支持的更新类型会抛出错误
 */
export const changeVersionType = (
  oldVersion: string,
  type: VersionUpdateType,
): string => {
  // 1. 校验版本号格式（仅允许 x.y.z 格式，x/y/z 为非负整数）
  const versionReg = /^(\d+)\.(\d+)\.(\d+)$/;
  const match = oldVersion.match(versionReg);

  if (!match) {
    throw new Error(
      `非法版本号：${oldVersion}，请遵循 x.y.z 格式（x/y/z 为非负整数）`,
    );
  }

  // 2. 解析版本号
  const versionParts = parseVersionParts(match);

  // 3. 根据更新类型递增对应段位
  const newVersionParts = incrementVersion(versionParts, type);

  // 4. 拼接为新版本号并返回
  return formatVersion(newVersionParts);
};

/**
 * 解析版本号组成部分
 */
const parseVersionParts = (match: RegExpMatchArray): VersionParts => {
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

/**
 * 根据更新类型递增版本
 */
const incrementVersion = (
  parts: VersionParts,
  type: VersionUpdateType,
): VersionParts => {
  const { major, minor, patch } = parts;

  switch (type) {
    case '0': {
      return { major: major + 1, minor: 0, patch: 0 };
    }
    case '10': {
      return { major, minor: minor + 1, patch: 0 };
    }
    case '20': {
      return { major, minor, patch: patch + 1 };
    }
    default: {
      // 这里实际上不会执行，因为 TypeScript 会进行类型检查
      throw new Error(
        `不支持的更新类型：${type}，仅支持 版本升级/特性更新/修订补丁`,
      );
    }
  }
};

/**
 * 格式化版本号
 */
const formatVersion = (parts: VersionParts): string => {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
};

/**
 * 比较两个版本号
 * @param v1 版本号1（格式：x.y.z...）
 * @param v2 版本号2（格式：x.y.z...）
 * @returns 1: v1 > v2, -1: v1 < v2, 0: 相等
 * console.log(compareVersion('1.11.0', '1.9.9')); // 1
 * console.log(compareVersion('1.9.9', '1.11.0')); // -1
 * console.log(compareVersion('1.0.0', '1.0.0')); // 0
 * console.log(compareVersion('2.0', '2.0.0')); // 0
 * console.log(compareVersion('1.0.1', '1.0.0')); // 1
 */
export function compareVersion(v1: string, v2: string): number {
  const v1Parts = v1.split('.');
  const v2Parts = v2.split('.');
  const len = Math.max(v1Parts.length, v2Parts.length);

  // 填充较短的版本号，确保长度一致
  while (v1Parts.length < len) {
    v1Parts.push('0');
  }
  while (v2Parts.length < len) {
    v2Parts.push('0');
  }

  // 逐段比较版本号
  for (let i = 0; i < len; i++) {
    const num1 = Number.parseInt(v1Parts[i]!, 10);
    const num2 = Number.parseInt(v2Parts[i]!, 10);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}
