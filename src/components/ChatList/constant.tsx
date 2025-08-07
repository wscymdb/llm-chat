import { CopyOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import type { Bubble } from '@ant-design/x';
import { Button, Spin, type GetProp } from 'antd';
import Markdown from '../Markdown';

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
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
    messageRender: (content) => <Markdown>{content}</Markdown>,
  },
  user: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    messageRender: (content) => <Markdown>{content}</Markdown>,
  },
};
