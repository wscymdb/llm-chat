import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList';

type StatusType = 'loading' | 'done' | 'error';
export type CustomBubbleDataType = BubbleDataType & { status: StatusType };
