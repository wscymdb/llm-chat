import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';

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
    // 注意这里：不 await，直接得到 AsyncIterable 进行流式处理
    const stream = await openai.chat.completions.create({
      messages: messages,
      model: 'deepseek-chat',
      stream: true,
    });

    // openai返回的是AsyncIterable，逐步推送消息给前端
    for await (const chunk of stream) {
      if (chunk) {
        console.log(chunk);
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

app.use(express.json());

// 使用路由
// 当path是users的时候才会执行userRouter中间件
app.use('/chat', chatRouter);
// 监听端口
app.listen(8888, () => {
  console.log('8888端口监听成功');
});
