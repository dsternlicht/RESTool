import { toast } from 'react-toastify';
import { INotification, NotificationType } from '../common/models/notification.types';

class NotificationService extends EventTarget {
  private useToast: boolean = true;
  private static readonly NOTIFICATION_EVENT = 'notification';

  constructor() {
    super();
  }

  setMode(useToast: boolean) {
    this.useToast = useToast;
  }

  private notify(type: NotificationType, message: string) {
    if (this.useToast) {
      if (!message) {
        toast.dismiss(); // Clear all toasts if message is empty
        return;
      }
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'info':
          toast.info(message);
          break;
      }
    } else {
      const notification: INotification | null = message ? { type, message } : null;
      this.dispatchEvent(new CustomEvent(NotificationService.NOTIFICATION_EVENT, { 
        detail: notification
      }));
    }
  }

  success(message: string) {
    this.notify('success', message);
  }

  error(message: string) {
    this.notify('error', message);
  }

  info(message: string) {
    this.notify('info', message);
  }

  clear() {
    this.notify('info', '');
  }

  subscribe(callback: (notification: INotification | null) => void) {
    const listener = ((event: Event) => {
      const customEvent = event as CustomEvent<INotification | null>;
      callback(customEvent.detail);
    });
    this.addEventListener(NotificationService.NOTIFICATION_EVENT, listener);
    return listener; // Return the listener so it can be used for unsubscribe
  }

  unsubscribe(listener: EventListener) {
    this.removeEventListener(NotificationService.NOTIFICATION_EVENT, listener);
  }
}

export const notificationService = new NotificationService();
