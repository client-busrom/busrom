export const PRELOADER_EVENT = 'busrom:preloader-done';

let _isDone = false;

export function setPreloaderDone() {
  _isDone = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRELOADER_EVENT));
  }
}

export function isPreloaderDone() {
  return _isDone;
}
