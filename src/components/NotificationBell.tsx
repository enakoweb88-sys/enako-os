import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      const version = api.notificationReadVersion();
      return (
      api
        .notifications()
        .then((result) => {
          if (active && version === api.notificationReadVersion()) setItems(Array.isArray(result) ? result : []);
        })
        .catch(() => {}));
    };
    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('enako:notifications-read', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('enako:notifications-read', refresh);
    };
  }, [user?.id]);
  const unread = items.filter((item) => !item.readAt).length;
  return (
    <div className="relative">
      <button
        aria-label={`Notifications, ${unread} unread`}
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-slate-200 p-2"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1 text-[10px] text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex justify-between border-b p-3 text-sm font-semibold">
            Notifications
            <button onClick={() => setOpen(false)} className="text-xs">
              Close
            </button>
          </div>
          {items.length ? (
            items.map((item) => (
              <button
                key={item.id}
                className="block w-full border-b p-3 text-left text-xs hover:bg-slate-50"
                onClick={async () => {
                  try { await api.markNotificationRead(item.id); }
                  catch { toast.error('Could not save read status. Please try again.'); return; }
                  setItems((current) =>
                    current.map((row) =>
                      row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row,
                    ),
                  );
                  setOpen(false);
                  if (item.link) navigate(item.link);
                }}
              >
                <b>{item.title}</b>
                <p className="mt-1 text-slate-600">{item.body}</p>
              </button>
            ))
          ) : (
            <p className="p-4 text-xs text-slate-500">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
