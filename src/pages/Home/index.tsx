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

const DEFAULT_CONVERSATIONS_ITEMS = [
  {
    key: 'default-0',
    label: 'What is Ant Design X?',
    group: 'Today',
    messages: [
      {
        id: 'msg_0',
        message: {
          role: 'user',
          content: '你好',
        },
        status: 'local',
      },
      {
        id: 'msg_2',
        message: {
          content: '你好！😊 很高兴见到你～有什么我可以帮你的吗？',
          role: 'assistant',
        },
        status: 'success',
      },
      {
        id: 'msg_3',
        message: {
          role: 'user',
          content: '你是谁',
        },
        status: 'local',
      },
      {
        id: 'msg_5',
        message: {
          content:
            '我是 **DeepSeek Chat**，由深度求索公司（DeepSeek）开发的智能 AI 助手！🤖✨  \n\n我的任务是帮助你解答问题、提供信息、陪你聊天，甚至帮你处理各种文本、文件等内容。无论是学习、工作，还是日常生活中的疑问，我都会尽力帮你解决！💡  \n\n有什么想问的，尽管告诉我吧！😊',
          role: 'assistant',
        },
        status: 'success',
      },
    ],
  },
  {
    key: 'default-1',
    label: 'How to quickly install and import components?',
    group: 'Today',
  },
  {
    key: 'default-2',
    label: 'New AGI Hybrid Interface',
    group: 'Yesterday',
  },
];

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

  const onMineRequest = async (messages: BubbleDataType[]) => {
    console.log(messages);
    agent.request(
      {
        messages,
        stream: true,
      },
      {
        onSuccess: (chunks) => {
          // setStatus('success');
          console.log('onSuccess', chunks);
        },
        onError: (error) => {
          // setStatus('error');
          console.error('onError', error);
        },
        onUpdate: (chunk) => {
          // setLines((pre) => [...pre, chunk]);
          console.log('onUpdate', chunk);
        },
      },
    );
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
    // requestPlaceholder: () => {
    //   return {
    //     content: <SyncOutlined spin />,
    //     role: 'assistant',
    //   };
    // },
    transformMessage: (info) => {
      const { originMessage, chunk } = info || {};
      // console.log(info, 'info');
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
