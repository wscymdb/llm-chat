import Home from '@/pages/Home';
import Overview from '@/pages/Overview';
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    index: true,
    Component: Home,
  },
  {
    path: '/overview',
    Component: Overview,
  },
]);

export default router;
