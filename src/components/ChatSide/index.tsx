import { HomeContext } from '@/context/HomeContext';
import useLLMStore from '@/store';
import { compareDate } from '@/utils/compareDate';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Conversations, type Conversation } from '@ant-design/x';
import { Button, Flex, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useContext, useState } from 'react';
import { v4 as uuid } from 'uuid';
import RenameModal from '../RenameModal';
import style from './style';

const ChatSide = () => {
  const { styles } = style();
  const [showRename, setShowRename] = useState(false);

  const {
    conversations,
    curConversation,
    setLocalConversation,
    onConversationChange,
    setCurConversation,
    removeLocalConversation,
    addMessages,
  } = useLLMStore();

  const { messages, setMessages } = useContext(HomeContext);

  // 添加
  const handleAdd = () => {
    const date = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const id = uuid();
    const conversation = {
      key: id,
      label: '新的聊天',
      date,
      group: compareDate(date),
    };

    setLocalConversation(conversation);
    setCurConversation(id);
    setMessages([]);
  };

  // 删除
  const handleDelete = (item: Conversation) => {
    removeLocalConversation(item.key);
  };

  const handleChange = async (currKey: string, prevKey: string) => {
    if (currKey === prevKey) return;
    await addMessages(prevKey, messages);
    setMessages([]);

    onConversationChange(currKey);
  };

  return (
    <>
      <div className={styles.side}>
        <div className={styles.logo}>
          <span>LLM问答</span>
        </div>
        {/* 🌟 添加会话 */}
        <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
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
          onActiveChange={(curr) => handleChange(curr, curConversation)}
          groupable
          styles={{ item: { padding: '0 8px' } }}
          menu={(conversation) => ({
            items: [
              {
                label: 'Rename',
                key: 'rename',
                icon: <EditOutlined />,
                onClick: () => setShowRename(true),
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

        <Flex align="center" justify="end" className={styles.sideFooter}>
          {/* <Avatar size={24} /> */}
          <Tooltip title="啦啦啦～">
            <Button type="text" icon={<QuestionCircleOutlined />} />
          </Tooltip>
        </Flex>
      </div>
      {showRename && <RenameModal onClose={() => setShowRename(false)} />}
    </>
  );
};

export default ChatSide;
