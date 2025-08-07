import ChatList from '@/components/ChatList';
import ChatSender from '@/components/ChatSender';
import ChatSide from '@/components/ChatSide';
import { HomeContext } from '@/context/HomeContext';
import useChat from '@/hooks/useChat';
import useLLMStore from '@/store';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React, { useEffect, useMemo, useState } from 'react';
import style from './style';
// for date-picker i18n
import useAutoSaveOnPageLeave from '@/hooks/useAutoSaveOnPageLeave';
import 'dayjs/locale/zh-cn';

const Independent: React.FC = () => {
  const { styles } = style();
  const [showSender, setShowSender] = useState(true);
  const { curConversation, conversations, addMessages, changeLocalConversationLabel, initConversations } =
    useLLMStore();
  const { messages, setMessages, customRequest } = useChat();

  const curSession = useMemo(() => {
    return conversations.find((item) => item.key === curConversation);
  }, [conversations, curConversation]);

  useEffect(() => {
    if (!conversations.length || !curConversation) {
      setShowSender(false);
      return;
    }
    setShowSender(true);
  }, [conversations, curConversation]);

  useEffect(() => {
    initConversations();
  }, []);

  // ==============自动保存数据=====================
  // 获取要保存的数据
  const getLatestData = () => ({
    curConversation,
    messages,
  });

  // 保存方法
  const saveData = async ({ curConversation, messages }: any) => {
    await addMessages(curConversation, messages);
  };

  useAutoSaveOnPageLeave(getLatestData, saveData, [curConversation, messages]);
  // ===================================

  const changeConversationTitle = async (message: string) => {
    try {
      const result = await fetch('http://127.0.0.1:8888/chat/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const { title } = await result.json();
      changeLocalConversationLabel(curConversation, title);
      console.log(title, curConversation, conversations);
    } catch (error) {}
  };

  const loading = false;

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#000000',
        },
      }}
    >
      <HomeContext.Provider
        value={{
          loading,
          setMessages,
          onRequest: customRequest,
          messages,
          changeConversationTitle,
        }}
      >
        <div className={styles.layout}>
          <ChatSide />
          <div className={styles.chat}>
            <div className={styles.header}>{curSession?.label}</div>

            <ChatList />
            {showSender && <ChatSender />}
          </div>
        </div>
      </HomeContext.Provider>
    </ConfigProvider>
  );
};

export default Independent;
