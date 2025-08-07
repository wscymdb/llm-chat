import { HomeContext } from '@/context/HomeContext';
import { Bubble, Welcome } from '@ant-design/x';
import { Space } from 'antd';
import { useContext } from 'react';
import { roles } from './constant';
import style from './style';

const ChatList = () => {
  const { styles } = style();
  const { messages } = useContext(HomeContext);

  if (Array.isArray(messages) && !messages.length) {
    return (
      <div className={styles.chatList}>
        <Space
          direction="vertical"
          size={16}
          style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
          className={styles.placeholder}
        >
          <Welcome
            variant="borderless"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title="我是 DeepSeek，很高兴见到你！"
            description="我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~"
          />
        </Space>
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      <Bubble.List
        roles={roles}
        items={messages?.map((i: any) => ({
          content: i.content,
          role: i.role,
          classNames: {
            content: i.status === 'loading' ? styles.loadingMessage : '',
          },
          typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
        }))}
        style={{
          height: '100%',
          paddingInline: 'calc(calc(100% - 700px) /2)',
        }}
      />
    </div>
  );
};

export default ChatList;
