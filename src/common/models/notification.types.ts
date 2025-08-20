export type NotificationType = 'success' | 'error' | 'info';

export interface INotification {
  type: NotificationType;
  message: string;
}
