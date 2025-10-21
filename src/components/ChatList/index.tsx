import { HomeContext } from '@/context/HomeContext';
import { Bubble } from '@ant-design/x';
import { memo, useContext } from 'react';
import { roles } from './constant';
import style from './style';

const ChatList = memo(() => {
  const { styles } = style();
  const { messages } = useContext(HomeContext)!;

  return (
    <div className={styles.chatList}>
      <Bubble.List
        roles={roles}
        items={messages?.map((i) => {
          const isLoading = i?.status === 'loading';

          return {
            key: i.key,
            content: i.content,
            role: i.role,
            loading: i.content === '',
            classNames: {
              content: isLoading ? styles.loadingMessage : '',
            },
            typing: isLoading ? { step: 5, interval: 20 } : false,
          };
        })}
        style={{
          height: '100%',
        }}
      />
    </div>
  );
});

export default ChatList;
