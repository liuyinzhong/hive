/**
 * 交集数组检测: A数组在B数组里存在的元素。
 * @param {Array} arrA - 第一个数组（需要检查的数组）可以是对象数组或字符串数组）
 * @param {Array} arrB - 第二个数组（目标数组）可以是对象数组或字符串数组）
 * @param {string} key - 用于比较的对象字段名（如果数组是字符串数组，则忽略此参数）
 * @param {Boolean} Norepetition - 是否去重返回交集数组
 * @returns {Array} - 返回交集数组
 */
export const findCommonElements = <T>(
  arrA: T[],
  arrB: T[],
  key?: keyof T,
  Norepetition: boolean = false,
): T[] => {
  if (!arrA || !arrB) {
    return [];
  }

  // 如果提供了 key，则基于 key 创建 Set；否则直接使用值创建 Set
  const setB = new Set(
    key ? arrB.map((item) => item[key]) : (arrB as unknown[]),
  );

  // 遍历数组 A，筛选出存在于 setB 中的元素
  const commonElements = arrA.filter((item) =>
    key ? setB.has(item[key]) : setB.has(item),
  );

  // 如果需要去重，返回去重后的结果
  return Norepetition ? [...new Set(commonElements)] : commonElements;
};

/**
 * 计算两个数组的差异，返回仅存在于第一个数组中的元素
 *
 * 功能说明：
 * - 支持两种数组类型：字符串数组 或 结构一致的对象数组
 * - 字符串数组：直接比较元素值是否相等
 * - 对象数组：需指定用于比较的字段名（key），通过该字段的值判断元素是否相等
 *
 * @param {Array<string | object>} arrayA - 基准数组（从中筛选差异元素）
 * @param {Array<string | object>} arrayB - 对比数组（用于判断元素是否存在）
 * @param {string} [key] - 可选，对象数组比较时的字段名（字符串数组无需传递）
 * @returns {Array<string | object>} 仅存在于 arrayA 中而不存在于 arrayB 中的元素
 * @throws {Error} 若输入不是数组、数组元素类型不匹配（如一个是字符串数组一个是对象数组）、
 *                 或对象数组未指定 key 时抛出错误
 *
 * const arr1 = ['a', 'b', 'c', 'd'];
 * const arr2 = ['b', 'd', 'e'];
 * // 计算 arr1 中不在 arr2 中的元素
 * const result = getDifference(arr1, arr2);
 * console.log(result); // 输出：['a', 'c']
 */
export const getDifference = (
  arrayA: Array<any>,
  arrayB: Array<any>,
  key?: string,
): Array<any> => {
  // 检查输入是否为数组
  if (!Array.isArray(arrayA) || !Array.isArray(arrayB)) {
    throw new Error('入参不是数组');
  }

  // 处理空数组情况（避免后续取 [0] 报错）
  if (arrayA.length === 0) return [];
  if (arrayB.length === 0) return [...arrayA];

  const typeA = typeof arrayA[0];
  const typeB = typeof arrayB[0];

  // 校验数组元素类型是否一致
  if (typeA !== typeB) {
    throw new Error('参数A 和参数B 的元素类型不匹配');
  }

  // 字符串数组比较
  if (typeA === 'string') {
    const setB = new Set(arrayB);
    return arrayA.filter((item) => !setB.has(item));
  }

  // 对象数组比较（需指定key）
  if (typeA === 'object') {
    if (!key || typeof key !== 'string') {
      throw new Error('对象数组比较需指定有效的key参数');
    }
    const setBKeys = new Set(arrayB.map((item) => item[key]));
    return arrayA.filter((item) => !setBKeys.has(item[key]));
  }

  // 不支持的元素类型（如数字、布尔等）
  throw new Error('仅支持字符串数组或对象数组的比较');
};

/**
 * 子集检查：第一个数组的所有元素是否都存在于第二个数组中。
 *
 * @param {Array} array1 - 要检查的数组，判断其所有元素是否存在于另一个数组中。
 * @param {Array} array2 - 目标数组，在其中查找array1的每个元素是否存在。
 * @returns {boolean} 如果array1中的所有元素都在array2中存在，则返回true；否则返回false。
 */
export const isSubset = (array1: any, array2: any) => {
  if (!array1 || !array2) {
    return false;
  }
  const set = new Set(array2);
  return array1.every((value: any) => set.has(value));
};

/** 数组去重 */
export const uniqueArray = (arr: any[]) => {
  if (!arr) {
    return [];
  }
  return [...new Set(arr)].filter((item) => item !== '');
};

/**
 数组对象去重
 @param data 数据源
 @param key 按哪个字段去重
 @returns 去重后的结果
 */
export const uniqueByKey = (data: any[], key: string) => {
  const seen = new Set();
  return data.filter((item) => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    } else {
      seen.add(keyValue);
      return true;
    }
  });
};

/**
 * 使用递归方法展平任意维度的数组。二维转一维，多维转一维
 * @param {Array<any>} arr - 输入的多维数组
 * @returns {Array<any>} - 展平后的一维数组
 */
export const flattenArrayRecursively = (arr: any) => {
  if (!arr) {
    return [];
  }
  // 使用 reduce 遍历数组
  return arr.reduce((acc: any, curr: any) => {
    // 如果当前元素是数组，则递归展平；否则直接添加到结果数组中
    return acc.concat(
      Array.isArray(curr) ? flattenArrayRecursively(curr) : curr,
    );
  }, []);
};
