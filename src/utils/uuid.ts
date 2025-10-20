/**
 * 生成唯一ID
 * 优先使用 crypto.randomUUID()，如果不支持则使用时间戳+随机数回退方案
 */
export function generateUniqueId(prefix: string = 'assistant'): string {
  // 检查是否在支持 crypto 的环境中
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // 回退方案：时间戳 + 随机数
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
}
