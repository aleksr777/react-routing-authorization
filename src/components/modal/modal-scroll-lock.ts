type PageScrollLock = {
  x: number;
  y: number;
  rootMinHeight: string;
  rootOverflowY: string;
  ghostScrollbar: HTMLElement | null;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
};

const openedDialogs: HTMLDialogElement[] = [];
let pageScrollLock: PageScrollLock | null = null;

const lockPageScroll = () => {
  if (pageScrollLock) return;
  const root = document.documentElement;
  const body = document.body;
  const bodyRect = body.getBoundingClientRect();
  const scrollbarWidth = Math.max(window.innerWidth - root.clientWidth, 0);
  const documentHeight = root.scrollHeight;
  const viewportHeight = window.innerHeight;
  const maxScroll = Math.max(documentHeight - viewportHeight, 0);
  let ghostScrollbar: HTMLElement | null = null;

  if (scrollbarWidth > 0 && maxScroll > 0) {
    const track = document.createElement('div');
    const thumb = document.createElement('div');
    const thumbHeight = Math.max((viewportHeight / documentHeight) * viewportHeight, 28);
    const thumbTravel = Math.max(viewportHeight - thumbHeight, 0);
    const thumbTop = (window.scrollY / maxScroll) * thumbTravel;

    Object.assign(track.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      zIndex: '0',
      width: scrollbarWidth + 'px',
      height: '100dvh',
      background: '#dfe5f6',
      pointerEvents: 'none',
    });
    Object.assign(thumb.style, {
      width: '100%',
      height: thumbHeight + 'px',
      minHeight: '28px',
      border: '3px solid transparent',
      borderRadius: '999px',
      background: '#8794bb',
      backgroundClip: 'padding-box',
      transform: 'translateY(' + thumbTop + 'px)',
    });
    track.append(thumb);
    document.body.append(track);
    ghostScrollbar = track;
  }

  pageScrollLock = {
    x: window.scrollX,
    y: window.scrollY,
    rootMinHeight: root.style.minHeight,
    rootOverflowY: root.style.overflowY,
    ghostScrollbar,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
  };
  root.style.minHeight = root.scrollHeight + 'px';
  root.style.overflowY = 'hidden';
  body.style.position = 'fixed';
  body.style.top = bodyRect.top + 'px';
  body.style.left = bodyRect.left + 'px';
  body.style.right = 'auto';
  body.style.width = bodyRect.width + 'px';
};

const unlockPageScroll = () => {
  if (!pageScrollLock) return;
  const lock = pageScrollLock;
  pageScrollLock = null;
  const root = document.documentElement;
  const body = document.body;
  lock.ghostScrollbar?.remove();
  window.scrollTo(lock.x, lock.y);
  body.style.position = lock.bodyPosition;
  body.style.top = lock.bodyTop;
  body.style.left = lock.bodyLeft;
  body.style.right = lock.bodyRight;
  body.style.width = lock.bodyWidth;
  root.style.minHeight = lock.rootMinHeight;
  root.style.overflowY = lock.rootOverflowY;
};

export const addOpenDialog = (dialog: HTMLDialogElement) => {
  openedDialogs.push(dialog);
  if (openedDialogs.length === 1) lockPageScroll();
};

export const removeOpenDialog = (dialog: HTMLDialogElement) => {
  const index = openedDialogs.lastIndexOf(dialog);
  if (index !== -1) openedDialogs.splice(index, 1);
  if (!openedDialogs.length) unlockPageScroll();
};

export const isTopmostDialog = (dialog: HTMLDialogElement) => openedDialogs.at(-1) === dialog;

export const canScrollWithinDialog = (
  target: EventTarget | null,
  dialog: HTMLDialogElement,
  deltaY: number,
) => {
  if (!(target instanceof Node) || !dialog.contains(target)) return false;
  let element = target instanceof Element ? target : target.parentElement;
  while (element) {
    if (element.scrollHeight > element.clientHeight) {
      if (deltaY < 0 && element.scrollTop > 0) return true;
      if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) {
        return true;
      }
    }
    if (element === dialog) break;
    element = element.parentElement;
  }
  return false;
};
