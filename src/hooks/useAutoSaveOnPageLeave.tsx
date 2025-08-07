import { useEffect, useRef } from 'react';

/**
 * @param getLatestData 获取要保存的数据（返回对象或数组）
 * @param saveData 保存函数（可以是异步、同步均可）
 * @param deps 依赖（啥变了要重新执行这个 hook，通常你保存函数和数据源有没有变化）
 */
function useAutoSaveOnPageLeave(
  getLatestData: () => any,
  saveData: (data: any) => void | Promise<void>,
  deps: any[] = [],
) {
  // 用 ref 持有 getLatestData 与 saveData 的最新实例，避免闭包陷阱
  const getLatestDataRef = useRef(getLatestData);
  const saveDataRef = useRef(saveData);

  useEffect(() => {
    getLatestDataRef.current = getLatestData;
  }, [getLatestData, ...deps]);

  useEffect(() => {
    saveDataRef.current = saveData;
  }, [saveData, ...deps]);

  useEffect(() => {
    // 统一处理保存
    const saveHandler = () => {
      const data = getLatestDataRef.current();
      if (data) {
        saveDataRef.current(data);
      }
    };

    // beforeunload: 离开当前页面
    window.addEventListener('beforeunload', saveHandler);
    // pagehide: 移动端等部分浏览器，切换页面也会触发
    window.addEventListener('pagehide', saveHandler);

    // visibilitychange: 切换 Tab/后台时
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        saveHandler();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      window.removeEventListener('beforeunload', saveHandler);
      window.removeEventListener('pagehide', saveHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);
}

export default useAutoSaveOnPageLeave;
