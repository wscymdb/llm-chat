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

  const messagesRef = useRef<CustomBubbleDataType[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // delta 缓冲和 rAF 合并，减少频繁 setState 引起的重渲染
  const deltaBufferRef = useRef<Record<string, string>>({});
  const rafScheduledRef = useRef(false);

  function appendDeltaAndFlush(id: string, piece: string) {
    // 把收到的 delta 片段累加到对应 message id 的缓冲里
    // deltaBufferRef.current 是一个 ref，保存每个 message id 的未刷新内容
    deltaBufferRef.current[id] = (deltaBufferRef.current[id] || '') + piece;

    // 如果已经有一次 rAF 排程在等待中，就直接返回（合并到那一次排程）
    // 这样可以把多个快速到来的 delta 合并一次性更新，减少渲染
    if (rafScheduledRef.current) return;

    // 标记 rAF 已排程，避免重复排队
    rafScheduledRef.current = true;

    // 使用 requestAnimationFrame 在下一次浏览器绘制前批量刷新 state
    requestAnimationFrame(() => {
      // 清理排程标志，允许下次继续排队
      rafScheduledRef.current = false;

      // 如果组件已卸载（避免竞态更新），清空 buffer 并返回
      if (!isMountedRef.current) {
        deltaBufferRef.current = {};
        return;
      }

      // 使用函数式 setState 基于 prev 计算新消息数组，保证与 React state 同步
      setMessages((prev) => {
        let changed = false; // 标记是否有实际变更，避免不必要的 setState

        // 遍历当前消息列表，将对应 id 的缓冲追加到 content
        const next = prev.map((m) => {
          // 读取并消费对应 key 的缓冲内容
          const mid = m.key as string;
          const buf = deltaBufferRef.current[mid];

          // 如果没有缓冲则返回原对象（保持引用相同以便 React 做 props 比较）
          if (!buf) return m;

          // 有缓冲则需要更新：合并旧内容与新片段，并保持 loading 状态
          changed = true;
          const updated: CustomBubbleDataType = {
            ...m,
            content: (m.content || '') + buf,
            status: 'loading',
          };

          // 已经消费该缓冲，删除以释放内存并避免重复应用
          if (mid) delete deltaBufferRef.current[mid];
          return updated;
        });

        // 如果有任何更新，先同步到 messagesRef（避免后续调用使用 stale 值），并返回新数组触发渲染
        if (changed) {
          messagesRef.current = next;
          return next;
        }

        // 若无改动则返回 prev（保持引用），React 不会重新渲染
        return prev;
      });
    });
  }

  // 派发用户消息+AI (占位) 消息，并内置流式拼接与 loading 状态管理
  const customRequest = (userMessage: CustomBubbleDataType) => {
    const id = `assistant-${Date.now()}`;
    const aiMsg: CustomBubbleDataType = {
      // id,
      key: id,
      role: 'assistant',
      content: '',
      status: 'loading',
    };

    // 将新消息追加到 state 并同步到 ref，避免后续 fetch 使用 stale messages
    setMessages((prev) => {
      const next = [...prev, userMessage, aiMsg];
      messagesRef.current = next;
      return next;
    });
    setLoading(true);

    // 传入当前最新 messages（messagesRef），fetchSSE 内部不会依赖闭包的旧值
    fetchSSE(messagesRef.current, (delta) => {
      appendDeltaAndFlush(id, delta);
    })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!isMountedRef.current) return;

        // 标记 ai 消息为成功
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === id);
          if (idx === -1) return prev;
          // 'done' 是预定义的 StatusType 值之一，用来表示已完成
          const updated: CustomBubbleDataType = { ...prev[idx], status: 'done' };
          const next = [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
          messagesRef.current = next;
          return next;
        });

        setLoading(false);
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

    try {
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
          console.error(error);
        }
      }
    } finally {
      // 尝试关闭 reader
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  }

  return { messages, setMessages, loading, customRequest };
};

export default useChat;
