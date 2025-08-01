import { HomeContext } from '@/context/HomeContext';
import { CopyOutlined, DislikeOutlined, LikeOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble, Welcome } from '@ant-design/x';
import { Button, Space, Spin, type GetProp } from 'antd';
import { useContext } from 'react';
import style from './style';

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  assistant: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: 600,
    },
    footer: (
      <div style={{ display: 'flex' }}>
        <Button type="text" size="small" icon={<ReloadOutlined />} />
        <Button type="text" size="small" icon={<CopyOutlined />} />
        <Button type="text" size="small" icon={<LikeOutlined />} />
        <Button type="text" size="small" icon={<DislikeOutlined />} />
      </div>
    ),
    loadingRender: () => <Spin size="small" />,
  },
  user: { placement: 'end', avatar: { icon: <UserOutlined />, style: { background: '#87d068' } } },
};

const ChatList = () => {
  const { styles } = style();
  const { messages } = useContext(HomeContext);

  return (
    <div className={styles.chatList}>
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          roles={roles}
          items={messages?.map((i: any) => ({
            ...i.message,
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
      ) : (
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
      )}
    </div>
  );
};

export default ChatList;
