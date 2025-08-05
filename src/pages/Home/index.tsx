import ChatList from '@/components/ChatList';
import ChatSender from '@/components/ChatSender';
import ChatSide from '@/components/ChatSide';
import { HomeContext } from '@/context/HomeContext';
import useChat from '@/hooks/useChat';
import useLLMStore from '@/store';
import React, { useEffect, useState } from 'react';
import style from './style';

const Independent: React.FC = () => {
  const { styles } = style();
  const [showSender, setShowSender] = useState(true);
  const { curConversation, conversations, initConversations } = useLLMStore();
  const { messages, setMessages, customRequest } = useChat();

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

  const loading = false;

  return (
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
          <ChatList />
          {showSender && <ChatSender />}
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export default Independent;
