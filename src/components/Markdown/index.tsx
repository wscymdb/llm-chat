import { Space } from 'antd';
import { useTheme } from 'antd-style';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import CopyButton from '../CopyButton';
import FullscreenButton from '../FullscreenButton';

const Code = (childrens: any) => {
  const { className, children, ...props } = childrens;
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  const { isDarkMode } = useTheme();
  // 全屏特定元素
  const containerRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);

  // 使用 useEffect 来处理 ref 的更新
  useEffect(() => {
    if (containerRef.current) {
      setElement(containerRef.current);
    }
  }, []);

  return match ? (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <Space
        style={{
          position: 'absolute',
          right: 8,
          top: 13,
          color: '#909090',
          fontSize: '16px',
          zIndex: 1,
        }}
      >
        <FullscreenButton showMessage={true} showTooltip={true} targetElement={element} />
        <CopyButton text={codeString} />
      </Space>
      <SyntaxHighlighter
        {...props}
        PreTag="div"
        children={codeString}
        language={match[1]}
        style={isDarkMode ? oneDark : oneLight}
        customStyle={{
          paddingRight: 70,
          background: isDarkMode ? '#1a1a1a' : '#f6f8fa',
        }}
      />
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

export default (props: PropsWithChildren<any>) => {
  const { children } = props;

  return (
    <Markdown
      children={children}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: (props) => <Code {...props} />,
      }}
    />
  );
};
