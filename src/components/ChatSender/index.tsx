import { HomeContext } from '@/context/HomeContext';
import { Sender } from '@ant-design/x';
import { Flex, message } from 'antd';
import { useContext, useRef, useState } from 'react';
import style from './style';

const ChatSender = () => {
  const { styles } = style();

  const abortController = useRef<AbortController>(null);
  const [inputValue, setInputValue] = useState('');
  const { loading, agent, onRequest, changeConversationTitle } = useContext(HomeContext);
  const firstRender = useRef(true);

  const onSubmit = (val: string) => {
    if (!val) return;

    if (firstRender.current) {
      // changeConversationTitle(val);
      firstRender.current = false;
    }

    if (loading) {
      message.error('Request is in progress, please wait for the request to complete.');
      return;
    }

    // onRequest({
    //   stream: true,
    //   message: { role: 'user', content: val },
    // });
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
