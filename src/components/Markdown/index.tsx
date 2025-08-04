import { Typography } from 'antd';
import DOMPurify from 'dompurify';
import markDownIt from 'markdown-it';
import type { PropsWithChildren } from 'react';

// 净化html防止恶意攻击
function cleanHtml(content: string) {
  const cleanHtml = DOMPurify.sanitize(content);
  return cleanHtml;
}

const md = markDownIt({ html: true, breaks: true });

export default (props: PropsWithChildren<any>) => {
  const { children } = props;

  return (
    <Typography>
      <div dangerouslySetInnerHTML={{ __html: md.render(cleanHtml(children)) }}></div>
    </Typography>
  );
};
