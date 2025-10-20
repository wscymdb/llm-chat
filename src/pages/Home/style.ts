import { createStyles } from 'antd-style';

export default createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100vh;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
    `,

    // chat list 样式
    chat: css`
      height: 100%;
      flex: 1;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding-bottom: ${token.paddingLG}px;
    `,
    header: css`
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      height: 56px;
      line-height: 56px;
      padding: 0 10px;
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      background-color: transparent;
      background-image: radial-gradient(transparent 1px, rgba(149, 149, 149, 0.15) 1px);
      backdrop-filter: blur(3px);
      z-index: 99;
      background-size: 4px 4px;
      mask: linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);
    `,
  };
});
