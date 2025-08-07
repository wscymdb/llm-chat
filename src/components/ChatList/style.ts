import { createStyles } from 'antd-style';

export default createStyles(({ token, css }) => {
  return {
    chatList: css`
      flex: 1;
      overflow: auto;
      padding-bottom: 16px;

      .ant-bubble {
        &:first-child {
          margin-top: 56px;
        }
      }
    `,
    loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
    placeholder: css`
      padding-top: 58px;
    `,
  };
});
