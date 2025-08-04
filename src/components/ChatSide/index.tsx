import { HomeContext } from '@/context/HomeContext';
import useLLMStore from '@/store';
import { localCache } from '@/utils/cache';
import { compareDate } from '@/utils/compareDate';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Conversations, type Conversation } from '@ant-design/x';
import { Avatar, Button, message } from 'antd';
import dayjs from 'dayjs';
import { useContext, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import style from './style';

const HISTORY_CONVERSATIONS = 'historyConversations';

const ChatSide = () => {
  const { styles } = style();
  const abortController = useRef<AbortController>(null);

  const { conversations, curConversation, setLocalConversation, getLocalConversations, removeLocalConversation } =
    useLLMStore() as any;

  const { agent, setConversations, setCurConversation, setMessages, onActiveConversationChange } =
    useContext(HomeContext);

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

    const date = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const id = uuid();
    const conversation = {
      key: id,
      label: '新的聊天',
      date,
      group: compareDate(date),
    };
    const newConversations = getUpdatedConversations('add', conversation);

    setLocalConversation(conversation);
    setConversations(newConversations);
    setCurConversation(id);
    setMessages([]);
    localCache.setCache(HISTORY_CONVERSATIONS, newConversations);
  };

  // 删除
  const handleDelete = (item: Conversation) => {
    removeLocalConversation(item.key);
  };

  // 重命名
  const handleRename = (item: Conversation) => {
    console.log(item);
  };

  return (
    <div className={styles.sider}>
      <div className={styles.logo}>
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
