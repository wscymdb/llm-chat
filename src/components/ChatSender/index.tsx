import { HomeContext } from '@/context/HomeContext';
import { Sender } from '@ant-design/x';
import { Flex } from 'antd';
import { useContext, useRef, useState } from 'react';
import style from './style';

const ChatSender = () => {
  const { styles } = style();

  const abortController = useRef<AbortController>(null);
  const [inputValue, setInputValue] = useState('');
  const { loading, onRequest, changeConversationTitle } = useContext(HomeContext)!;
  const firstRender = useRef(true);

  const onSubmit = (val: string) => {
    if (!val.trim()) return;

    if (firstRender.current) {
      changeConversationTitle(val);
      firstRender.current = false;
    }

    // 这里进不来 因为组件层面loading会被拦截 后续入果使用自定义的组件这里要放开
    // if (loading) {
    //   message.error('Request is in progress, please wait for the request to complete.');
    //   return;
    // }

    onRequest({ role: 'user', content: val });
  };

  return (
    <Sender
      value={inputValue}
      onChange={setInputValue}
      onSubmit={() => {
        onSubmit(inputValue);
        setInputValue('');
      }}
      onCancel={() => {
        abortController.current?.abort();
      }}
      loading={loading}
      className={styles.sender}
      actions={(_, info) => {
        const { SendButton, LoadingButton } = info.components;
        return <Flex gap={4}>{loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}</Flex>;
      }}
      placeholder="输入你想要的问题吧～"
    />
  );
};

export default ChatSender;
