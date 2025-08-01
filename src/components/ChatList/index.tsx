import { HomeContext } from '@/context/HomeContext';
import { CopyOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble, Welcome } from '@ant-design/x';
import { Button, Space, Spin, Typography, type GetProp } from 'antd';
import DOMPurify from 'dompurify';
import markdownit from 'markdown-it';
import { useContext } from 'react';
import style from './style';

function parseCleanHtml(content) {
  const cleanHtml = DOMPurify.sanitize(content);
  return cleanHtml;
}

const md = markdownit({ html: true, breaks: true });

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
      </div>
    ),
    loadingRender: () => <Spin size="small" />,
    messageRender(content) {
      return (
        <Typography>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
          <div dangerouslySetInnerHTML={{ __html: md.render(parseCleanHtml(content)) }} />
        </Typography>
      );
    },
  },
  user: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    messageRender(content) {
      return (
        <Typography>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
          <div dangerouslySetInnerHTML={{ __html: md.render(parseCleanHtml(content)) }} />
        </Typography>
      );
    },
  },
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
