import { HomeContext } from '@/context/HomeContext';
import { localCache } from '@/utils/cache';
import { compareDate } from '@/utils/compareDate';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Conversations, type Conversation } from '@ant-design/x';
import { Avatar, Button, message } from 'antd';
import dayjs from 'dayjs';
import { useContext, useRef } from 'react';
import style from './style';

const HISTORY_CONVERSATIONS = 'historyConversations';

const ChatSide = () => {
  const { styles } = style();
  const abortController = useRef<AbortController>(null);

  const {
    agent,
    conversations,
    setConversations,
    curConversation,
    setCurConversation,
    setMessages,
    onActiveConversationChange,
  } = useContext(HomeContext);

  const getUpdatedConversations = (type: 'add' | 'delete', conversation: Conversation) => {
    let history: Conversation[] = localCache.getCache(HISTORY_CONVERSATIONS) || [];

    if (type === 'add') {
      history.unshift(conversation);
    } else if (type === 'delete') {
      history = history.filter((item) => item.key !== conversation.key);
    }

    return history;
  };

  // 添加
  const handleAdd = () => {
    if (agent.isRequesting()) {
      message.error(
        'Message is Requesting, you can create a new conversation after request done or abort it right now...',
      );
      return;
    }

    const now = dayjs().valueOf().toString();
    const conversation = {
      key: now,
      label: '新的聊天',
      group: compareDate(now),
    };
    const newConversations = getUpdatedConversations('add', conversation);

    setConversations(newConversations);
    setCurConversation(now);
    setMessages([]);
    localCache.setCache(HISTORY_CONVERSATIONS, newConversations);
  };

  // 删除
  const handleDelete = (item: Conversation) => {
    const newConversations = getUpdatedConversations('delete', item);
    setConversations(newConversations);
    setCurConversation(newConversations[0]?.key);
    setMessages(newConversations[0]?.messages || []);
    localCache.setCache(HISTORY_CONVERSATIONS, newConversations);
  };

  // 重命名
  const handleRename = (item: Conversation) => {
    console.log(item);
  };

  return (
    <div className={styles.sider}>
      {/* 🌟 Logo */}
      <div className={styles.logo}>
        {/* <img
          src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
          draggable={false}
          alt="logo"
          width={24}
          height={24}
        /> */}
        <span>LLM问答</span>
      </div>

      {/* 🌟 添加会话 */}
      <Button onClick={handleAdd} type="link" className={styles.addBtn} icon={<PlusOutlined />}>
        开启新对话
      </Button>

      {/* 🌟 会话管理 */}
      <Conversations
        items={conversations}
        className={styles.conversations}
        activeKey={curConversation}
        // onActiveChange={async (val) => {
        //   abortController.current?.abort();
        // }}
        onActiveChange={(val) => onActiveConversationChange(val)}
        groupable
        styles={{ item: { padding: '0 8px' } }}
        menu={(conversation) => ({
          items: [
            {
              label: 'Rename',
              key: 'rename',
              icon: <EditOutlined />,
            },
            {
              label: 'Delete',
              key: 'delete',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => handleDelete(conversation),
            },
          ],
        })}
      />

      <div className={styles.siderFooter}>
        <Avatar size={24} />
        <Button type="text" icon={<QuestionCircleOutlined />} />
      </div>
    </div>
  );
};

export default ChatSide;
