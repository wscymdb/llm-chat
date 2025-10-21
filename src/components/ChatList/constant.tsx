import type { Bubble } from '@ant-design/x';
import { Space, Spin, type GetProp } from 'antd';
import CopyButton from '../CopyButton';
import Markdown from '../Markdown';

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  assistant: {
    placement: 'start',
    // avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    style: {
      // maxWidth: 800,
    },
    footer: (messageContext) => (
      <Space>
        {/* <Button type="text" size="small" icon={<ReloadOutlined />} style={{ color: '#909090' }} /> */}
        <CopyButton text={messageContext} style={{ color: '#909090' }} />
      </Space>
    ),
    loadingRender: () => <Spin size="small" />,
    // messageRender: (content) => <GPTVis>{content}</GPTVis>,
    messageRender: (content) => <Markdown>{content}</Markdown>,
  },
  user: {
    placement: 'end',
    // avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    messageRender: (content) => <Markdown>{content}</Markdown>,
    footer: (messageContext) => (
      <Space>
        {/* <Button type="text" size="small" icon={<ReloadOutlined />} style={{ color: '#909090' }} /> */}
        <CopyButton text={messageContext} style={{ color: '#909090' }} />
      </Space>
    ),
  },
};
