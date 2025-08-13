import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { INotification } from '../../common/models/notification.types';
import { notificationService } from '../../services/notification.service';
import './notificationBanner.scss';

export const NotificationBanner = () => {
  const [notification, setNotification] = useState<INotification | null>(null);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const listener = notificationService.subscribe((newNotification) => {
      setNotification(newNotification);
      setVisible(!!newNotification);
    });

    return () => {
      notificationService.unsubscribe(listener);
    };
  }, []);

  // Clear notification on route change
  useEffect(() => {
    setNotification(null);
    setVisible(false);
  }, [location]);

  if (!notification) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'exclamation-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'info-circle';
    }
  };

  return (
    <div className={`notification-banner ${notification.type} ${visible ? 'visible' : ''}`}>
      <div className="banner-content">
        <i className={`fa fa-${getIcon()}`} aria-hidden="true"></i>
        <span className="banner-message">{notification.message}</span>
      </div>
    </div>
  );
};
