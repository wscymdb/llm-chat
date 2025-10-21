import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const CopyButton = ({ text, className, style }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (isCopied) return;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // 2秒后恢复原样
    } catch (err) {
      message.error('复制失败');
    }
  };

  return (
    <div
      onClick={handleCopy}
      className={className}
      style={{
        cursor: 'pointer',
        ...style,
      }}
    >
      {isCopied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
    </div>
  );
};

export default CopyButton;
