import useLLMStore from '@/store';
import type { CustomBubbleDataType } from '@/types/BubbleType';
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList';
import { useEffect, useRef, useState } from 'react';

// 解析 SSE 片段
function parseSSE(buffer: string): [string[], string] {
  const events = buffer.split('\n\n');
  const rest = events.pop()!;
  return [events, rest];
}

function trimDataPrefix(raw: string): string {
  return raw
    .split('\n')
    .map((line) => line.replace(/^data: ?/, ''))
    .join('\n');
}

/**
 * 封装 SSE 请求
 */
const useChat = () => {
  const [messages, setMessages] = useState<CustomBubbleDataType[]>([]);
  const [loading, setLoading] = useState(false);

  const { curConversation, getMessages } = useLLMStore();

  // 初始化历史消息
  useEffect(() => {
    if (!curConversation) return;
    let cancelled = false;

    (async () => {
      const historyMsgs = await getMessages(curConversation);
      if (!cancelled) {
        setMessages(historyMsgs);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [curConversation, getMessages]);

  // 支持防止竞态的 isMounted
  const isMountedRef = useRef(true);
  // 组件卸载安全
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 派发用户消息+AI (占位) 消息，并内置流式拼接与 loading 状态管理
  const customRequest = (userMessage: CustomBubbleDataType) => {
    const id = `assistant-${Date.now()}`;
    const aiMsg: CustomBubbleDataType = {
      id,
      key: id,
      role: 'assistant',
      content: '',
      status: 'loading',
    };

    setMessages((prev) => [...prev, userMessage, aiMsg]);
    setLoading(true);

    fetchSSE([...messages, userMessage], (delta) => {
      console.log(delta, 'delta');

      setMessages((prev) => {
        const lastIdx = prev.findIndex((m) => m.id === aiMsg.id);

        if (lastIdx === -1) return prev;

        const mergedAI = {
          ...prev[lastIdx],
          content: (prev[lastIdx].content || '') + delta,
          status: 'loading', // 追加时保持 loading
        };

        return [...prev.slice(0, lastIdx), mergedAI, ...prev.slice(lastIdx + 1)];
      });
    }).finally(() => {
      if (!isMountedRef.current) return; // <- 组件已卸载，跳过后续更新

      // fetchSSE完成后给最后的aiMsg status=success
      setMessages((prev) => {
        const lastIdx = prev.findIndex((m) => m.id === aiMsg.id);
        if (lastIdx === -1) return prev;
        const mergedAI = {
          ...prev[lastIdx],
          status: 'success',
        };
        return [...prev.slice(0, lastIdx), mergedAI, ...prev.slice(lastIdx + 1)];
      });

      setLoading(false);

      // if (isMountedRef.current)
    });
  };

  // 封装fetch及SSE解析, 流式回调 onDelta
  async function fetchSSE(msgs: BubbleDataType[], onDelta: (content: string) => void) {
    const response = await fetch('http://127.0.0.1:8888/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ messages: msgs }),
    });

    if (!response.body) throw new Error('No body in response');
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let done = false;

    while (!done) {
      const { value, done: chunkDone } = await reader.read();
      done = chunkDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const [events, rest] = parseSSE(buffer);
        buffer = rest;
        for (const raw of events) {
          const eventText = trimDataPrefix(raw).trim();
          if (!eventText || eventText === '[DONE]') continue;

          try {
            const json = JSON.parse(eventText);
            if (json.choices && Array.isArray(json.choices) && json.choices[0]?.delta?.content) {
              const piece = json.choices[0].delta.content;
              onDelta(piece);
            }
          } catch (error) {
            // todo
            console.error(error);
          }
        }
      }
    }
    // 收尾
    if (buffer.trim()) {
      try {
        const eventText = trimDataPrefix(buffer).trim();
        if (eventText) {
          const json = JSON.parse(eventText);
          if (json.choices && Array.isArray(json.choices) && json.choices[0]?.delta?.content) {
            const piece = json.choices[0].delta.content;
            onDelta(piece);
          }
        }
      } catch (error) {
        // todo
        console.error(error);
      }
    }
  }

  return { messages, setMessages, loading, customRequest };
};

export default useChat;
