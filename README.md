# 配置文件注释

## .prettierrc

```json
{
  "printWidth": 80, // 每行代码最大长度为80个字符，超出就自动换行
  "singleQuote": true, // 字符串使用单引号（'）而不是双引号（"）
  "trailingComma": "all", // 对象和数组的最后一个元素后也加逗号
  "proseWrap": "never", // Markdown文档中的文本不自动换行
  "overrides": [
    {
      "files": ".prettierrc", // 针对.prettierrc这个配置文件
      "options": {
        "parser": "json" // 使用json解析器来格式化它
      }
    }
  ],
  // 插件都需要自己安装
  "plugins": [
    "prettier-plugin-organize-imports", // 插件：自动优化和排序import语句
    "prettier-plugin-packagejson" // 插件：美化并规范package.json
  ]
}
```
