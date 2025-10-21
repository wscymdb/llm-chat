import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import mainPrompt from './prompts/mainPrompt.js';

const app = express();

const key = 'sk-1f16db92531742638a658a5e43b4bd8b';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: key,
});

app.use(cors());

// 将用户的接口定义在单独的路由对象中
// 每个路由都可以看作是一个迷你的app 可以使用app的方法（get\post...）
const chatRouter = express.Router();

chatRouter.post('/', async (req, res) => {
  const { messages = [] } = req.body || {};

  // 设置SSE响应头，关键
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders(); // 立即刷新响应头

  try {
    const newMessages = [mainPrompt, ...messages];

    // 注意这里：不 await，直接得到 AsyncIterable 进行流式处理
    const stream = await openai.chat.completions.create({
      messages: newMessages,
      model: 'deepseek-chat',
      stream: true,
    });

    // openai返回的是AsyncIterable，逐步推送消息给前端
    for await (const chunk of stream) {
      if (chunk) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }
    // 发送流结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    // 错误时发送一条带 error 字段的消息
    res.write(`data: [ERROR] ${err?.message || '未知错误'}\n\n`);
    res.end();
  }
});

chatRouter.post('/title', async (req, res) => {
  const { messages = [] } = req.body || {};

  try {
    // 保证最后一条是“生成标题”指令
    const titlePrompt = {
      role: 'user',
      content: `你需要根据已有的对话生成一个标题，要求如下：
      1. 标题必须简洁明了，控制在10个汉字以内。
      2. 标题应准确反映对话的核心内容和主题。
      3. 避免使用模糊或通用的词汇，确保标题具有独特性。
      4. 不要包含任何引号或多余的标点符号。
      5. 只返回标题文本，不要添加任何解释或额外信息。
      6. 直接返回标题，不要使用任何引号。
      7. 标题应为中文。

      示例：
      错误示例：根据对话内容，标题应为： **情绪疏导**
      错误示范：情绪疏导
      `,
    };

    const newMessages = [titlePrompt, ...messages];

    const result = await openai.chat.completions.create({
      messages: newMessages,
      model: 'deepseek-chat',
    });

    // 假设返回结构与 OpenAI 类似
    const title = result?.choices?.[0]?.message?.content || '未生成标题';
    console.log(title);

    res.json({ title }); // 返回生成标题
  } catch (err) {
    res.status(500).json({ error: err?.message || '未知错误' });
  }
});

app.use(express.json());

// 使用路由
// 当path是users的时候才会执行userRouter中间件
app.use('/chat', chatRouter);
// 监听端口
app.listen(8888, () => {
  console.log('8888端口监听成功');
});
