module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复' },
    { value: 'docs', name: 'docs:     文档变更' },
    {
      value: 'style',
      name: 'style:    代码格式（不影响功能，例如空格、分号等）',
    },
    { value: 'refactor', name: 'refactor: 代码重构' },
    { value: 'test', name: 'test:     添加测试' },
    { value: 'chore', name: 'chore:    构建/工程依赖/工具升级等' },
  ],
  messages: {
    type: '请选择提交类型:',
    scope: '请输入影响范围 (可选):',
    subject: '请简要描述提交(必填):',
    body: '请输入详细描述 (可选):',
    breaking: '列举 BREAKING CHANGES (可选):',
    footer: '列举需关闭的 ISSUES (可选):',
    confirmCommit: '确认提交？',
  },
};
