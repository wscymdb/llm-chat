import dayjs from 'dayjs';

/**
 * 比较传入的日期与今天的关系，支持日期字符串、秒级/毫秒级时间戳。
 * 返回“今天”、“昨天”或格式化后的日期字符串（YYYY-MM-DD）。
 * 如果输入无效，返回“无效日期”。
 *
 * @param {string | number} input - 要比较的日期，可以为日期字符串、秒级或毫秒级时间戳
 * @returns {string} "今天"、"昨天"、格式化日期字符串或"无效日期"
 *
 * @example
 * compareDate('2024-06-19'); // => "今天"
 * compareDate(1718726400);   // => "今天"（如果当天为 2024-06-19）
 * compareDate(1718726400000);// => "今天"（如果当天为 2024-06-19）
 * compareDate('2024-06-17'); // => "2024-06-17"
 * compareDate('hello');      // => "无效日期"
 */
export const compareDate = (input: string | number): string => {
  let date =
    typeof input === 'number' || /^\d+$/.test(input + '')
      ? input.toString().length === 10
        ? dayjs(Number(input) * 1000)
        : dayjs(Number(input))
      : dayjs(input);

  if (!date.isValid()) {
    return '无效日期';
  }

  const today = dayjs();
  const yesterday = dayjs().subtract(1, 'day');

  if (date.isSame(today, 'day')) return '今天';
  if (date.isSame(yesterday, 'day')) return '昨天';
  return date.format('YYYY-MM-DD');
};
