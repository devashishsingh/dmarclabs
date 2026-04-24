'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface HeaderVisibilityContextValue {
  headerHidden: boolean;
  hideHeader: () => void;
  showHeader: () => void;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextValue>({
  headerHidden: false,
  hideHeader: () => {},
  showHeader: () => {},
});

export function HeaderVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const hideHeader = useCallback(() => setHeaderHidden(true), []);
  const showHeader = useCallback(() => setHeaderHidden(false), []);
  return (
    <HeaderVisibilityContext.Provider value={{ headerHidden, hideHeader, showHeader }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility() {
  return useContext(HeaderVisibilityContext);
}
