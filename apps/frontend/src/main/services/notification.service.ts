import { Notification } from 'electron';

export class NotificationService {
  send(title: string, body: string) {
    const notification = new Notification({ title, body });
    notification.show();
  }
}
