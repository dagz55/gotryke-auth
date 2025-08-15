
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type DirtyStateContextType = {
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  nextPath: string | null;
  setNextPath: React.Dispatch<React.SetStateAction<string | null>>;
  saveAction: (() => void) | null;
  setSaveAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  discardAction: (() => void) | null;
  setDiscardAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
};

const DirtyStateContext = createContext<DirtyStateContextType | undefined>(undefined);

export const DirtyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [saveAction, setSaveAction] = useState<(() => void) | null>(null);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isDirty && nextPath) {
      router.push(nextPath);
      setNextPath(null);
    }
  }, [isDirty, nextPath, router]);


  return (
    <DirtyStateContext.Provider value={{ isDirty, setIsDirty, nextPath, setNextPath, saveAction, setSaveAction, discardAction, setDiscardAction }}>
      {children}
    </DirtyStateContext.Provider>
  );
};

export const useDirtyState = () => {
  const context = useContext(DirtyStateContext);
  if (context === undefined) {
    throw new Error('useDirtyState must be used within a DirtyStateProvider');
  }
  return context;
};
