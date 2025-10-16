import type { CustomBubbleDataType } from '@/types/BubbleType';
import { createContext } from 'react';

interface HomeContextType {
  messages: CustomBubbleDataType[];
  [index: string]: any;
}
export const HomeContext = createContext<HomeContextType | null>(null);
