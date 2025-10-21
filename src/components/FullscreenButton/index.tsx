import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';

interface FullscreenButtonProps {
  className?: string;
  style?: React.CSSProperties;
  targetElement?: HTMLElement | null;
  showTooltip?: boolean;
  showMessage?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onFullscreenError?: (error: Error) => void;
}

const FullscreenButton = ({
  className,
  style,
  targetElement,
  showTooltip = true,
  showMessage = false,
  onFullscreenChange,
  onFullscreenError,
}: FullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;

      const newIsFullscreen = fullscreenElement === targetElement;
      setIsFullscreen(newIsFullscreen);
      onFullscreenChange?.(newIsFullscreen);

      if (showMessage && document.fullscreenElement === targetElement) {
        if (newIsFullscreen) {
          message.success('已进入全屏模式');
        } else {
          message.info('已退出全屏模式');
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange, showMessage, targetElement]);

  const enterFullscreen = async (element: HTMLElement) => {
    try {
      await element.requestFullscreen();
    } catch (err) {
      const error = err as Error;
      console.error('进入全屏失败:', error);
      onFullscreenError?.(error);
      if (showMessage) {
        message.error('进入全屏失败');
      }
    }
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (err) {
      const error = err as Error;
      console.error('退出全屏失败:', error);
      onFullscreenError?.(error);
      if (showMessage) {
        message.error('退出全屏失败');
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled) {
      message.warning('当前浏览器不支持全屏功能');
      return;
    }

    const target = targetElement || document.documentElement;
    const fullscreenElement = document.fullscreenElement;

    // 检查当前全屏元素是否是目标元素
    const isTargetFullscreen = fullscreenElement === target;

    if (!isTargetFullscreen) {
      // 如果有其他元素在全屏，先退出全屏
      if (fullscreenElement) {
        await exitFullscreen();
      }
      await enterFullscreen(target);
    } else {
      await exitFullscreen();
    }
  };

  const buttonContent = (
    <div onClick={toggleFullscreen} className={className} style={style} title={isFullscreen ? '退出全屏' : '进入全屏'}>
      {isFullscreen ? (
        <FullscreenExitOutlined style={{ cursor: 'pointer' }} />
      ) : (
        <FullscreenOutlined style={{ cursor: 'pointer' }} />
      )}
    </div>
  );

  if (showTooltip) {
    return <Tooltip title={isFullscreen ? '退出全屏' : '进入全屏'}>{buttonContent}</Tooltip>;
  }

  return buttonContent;
};

export default FullscreenButton;
