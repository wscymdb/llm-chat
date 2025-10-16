/**
 * Vite 插件：替换 HTML 中的 <title> 内容
 *
 * 用途：
 * - 在 dev 和 build 阶段，拦截并修改 index.html（或其它被 Vite 处理的 HTML），
 *   将 <title>...</title> 替换为传入的 title 字符串。
 *
 * 注意：
 * - 使用简单的正则替换，假如有多个 <title> 或复杂模板场景需调整实现。
 * - 若需在服务器端渲染场景下条件替换，可在钩子中检查 ctx 或其它上下文信息。
 *
 * @param title 要写入的页面标题，默认 "测试"
 * @returns Vite Plugin 对象
 */
import type { IndexHtmlTransformHook, Plugin } from 'vite';

const documentTitlePlugin = (title: string = '测试'): Plugin => {
  const transformIndexHtml: IndexHtmlTransformHook = (html) =>
    html.replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`);

  return {
    name: 'html-transform',
    transformIndexHtml,
  };
};

export default documentTitlePlugin;
