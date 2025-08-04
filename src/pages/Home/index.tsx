import ChatList from '@/components/ChatList';
import ChatSender from '@/components/ChatSender';
import ChatSide from '@/components/ChatSide';
import { HomeContext } from '@/context/HomeContext';
import { localCache } from '@/utils/cache';
import { useXAgent, useXChat, type Conversation } from '@ant-design/x';
import React, { useEffect, useRef, useState } from 'react';
import style from './style';

type BubbleDataType = {
  role: string;
  content: string;
};

const HISTORY_CONVERSATIONS = 'historyConversations';

// localCache.setCache(HISTORY_CONVERSATIONS, DEFAULT_CONVERSATIONS_ITEMS);

const Independent: React.FC = () => {
  const { styles } = style();
  const abortController = useRef<AbortController>(null);
  const [curConversation, setCurConversation] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [agent] = useXAgent<BubbleDataType>({
    baseURL: 'http://127.0.0.1:8888/chat/',
  });

  const changeConversationTitle = async (message: string) => {
    try {
      const result = await fetch('http://127.0.0.1:8888/chat/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const con = await result.json();
      console.log(con);
    } catch (error) {}
  };

  const loading = agent.isRequesting();

  // 请求
  const { onRequest, messages, setMessages } = useXChat({
    agent,
    requestFallback: (_, { error }) => {
      if (error.name === 'AbortError') {
        return {
          content: 'Request is aborted',
          role: 'assistant',
        };
      }
      return {
        content: 'Request failed, please try again!',
        role: 'assistant',
      };
    },
    requestPlaceholder: () => {
      return {
        content: '加载中...',
        role: 'assistant',
      };
    },
    transformMessage: (info) => {
      const { originMessage, chunk } = info || {};
      let currentContent = '';
      let currentThink = '';

      try {
        if (chunk?.data && !chunk?.data.includes('DONE')) {
          const message = JSON.parse(chunk?.data);
          currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
          currentContent = message?.choices?.[0]?.delta?.content || '';
        }
      } catch (error) {
        console.error(error);
      }

      let content = '';

      if (!originMessage?.content && currentThink) {
        content = `<think>${currentThink}`;
      } else if (
        originMessage?.content?.includes('<think>') &&
        !originMessage?.content.includes('</think>') &&
        currentContent
      ) {
        content = `${originMessage?.content}</think>${currentContent}`;
      } else {
        content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
      }

      return {
        content,
        role: 'assistant',
      };
    },
  });

  useEffect(() => {
    const history = localCache.getCache(HISTORY_CONVERSATIONS);

    if (Array.isArray(history) && history.length > 0) {
      setConversations(history);
      setCurConversation(history[0]?.key);
      setMessages(history[0]?.messages || []);
    }
  }, []);

  useEffect(() => {
    if (messages?.length) {
      const history = localCache.getCache(HISTORY_CONVERSATIONS);
      if (Array.isArray(history) && history.length > 0) {
        const find = history.find((item) => item.key === curConversation);
        if (find) {
          find.messages = messages;
          localCache.setCache(HISTORY_CONVERSATIONS, history);
        }
      }
    }
  }, [messages]);

  const onActiveConversationChange = (key: string) => {
    setCurConversation(key);

    console.log(key);
    const history = localCache.getCache(HISTORY_CONVERSATIONS);
    if (Array.isArray(history) && history.length > 0) {
      const find = history.find((item) => item.key === key);

      if (find) {
        setMessages(find.messages || []);
      }
    }
  };

  // ==================== Render =================
  return (
    <HomeContext.Provider
      value={{
        loading,
        agent,
        onRequest,
        messages,
        setMessages,
        conversations,
        setConversations,
        curConversation,
        setCurConversation,
        onActiveConversationChange,
        changeConversationTitle,
      }}
    >
      <div className={styles.layout}>
        <ChatSide />
        <div className={styles.chat}>
          <ChatList />
          <ChatSender />
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export default Independent;
