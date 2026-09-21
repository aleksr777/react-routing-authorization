import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getScrollbarMetrics } from './scrollbar-metrics';

export type ScrollbarState = {
  visible: boolean;
  thumbHeight: number;
  thumbTop: number;
  valueNow: number;
};

export type ScrollbarDrag = {
  pointerId: number;
  startY: number;
  startScrollY: number;
};

export const useScrollbarState = () => {
  const location = useLocation();
  const [state, setState] = useState<ScrollbarState>({
    visible: false,
    thumbHeight: 40,
    thumbTop: 0,
    valueNow: 0,
  });
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<ScrollbarDrag | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const metrics = getScrollbarMetrics(trackRef.current);
      setState({
        visible: metrics.maxScroll > 1,
        thumbHeight: metrics.thumbHeight,
        thumbTop: metrics.thumbTop,
        valueNow: metrics.valueNow,
      });
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    const delayedUpdate = window.setTimeout(scheduleUpdate, 0);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(document.documentElement);
    resizeObserver?.observe(document.body);
    if (trackRef.current) resizeObserver?.observe(trackRef.current);

    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleUpdate);
    mutationObserver?.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(delayedUpdate);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [location.key]);

  return { state, trackRef, thumbRef, dragRef };
};
