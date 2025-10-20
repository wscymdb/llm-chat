import '@/assets/styles/global.css';
import '@ant-design/v5-patch-for-react-19';
import 'dayjs/locale/zh-cn';
import 'normalize.css';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from '../router';

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
