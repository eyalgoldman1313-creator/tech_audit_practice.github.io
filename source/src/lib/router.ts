import { useEffect, useState } from 'react';

export function useHash(): string {
  const get = () => window.location.hash.replace(/^#/, '') || '/home';
  const [hash, setHash] = useState(get);
  useEffect(() => {
    const on = () => {
      setHash(get());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export function go(path: string): void {
  window.location.hash = path;
}
