'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Notification = {
  id: number;
  message: string;
  link?: string;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, link?: string) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(0);

  const addNotification = useCallback((message: string, link?: string) => {
    setNotifications(prev => [...prev, { id: nextId, message, link }]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
