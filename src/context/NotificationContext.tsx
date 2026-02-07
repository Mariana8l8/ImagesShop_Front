import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
};

type NotifyOptions = {
  type?: NotificationType;
  title?: string;
  duration?: number;
};

type NotificationContextValue = {
  notify: (message: string, options?: NotifyOptions) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const DEFAULT_DURATION = 4200;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
    const timeoutId = timeouts.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeouts.current[id];
    }
  }, []);

  const notify = useCallback(
    (message: string, options?: NotifyOptions) => {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const type = options?.type ?? "info";
      const title = options?.title;
      const duration = options?.duration ?? DEFAULT_DURATION;

      setNotifications((prev) => [...prev, { id, message, title, type }]);

      if (duration > 0) {
        timeouts.current[id] = window.setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {notifications.map((note) => (
          <div key={note.id} className={`toast toast-${note.type}`}>
            <div className="toast-content">
              {note.title && <div className="toast-title">{note.title}</div>}
              <div className="toast-message">{note.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => dismiss(note.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
