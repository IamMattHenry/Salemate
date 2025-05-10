import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, getNotificationIcon } from '../../context/NotificationContext';
import {
  MdNotifications,
  MdNotificationsNone,
  MdHistory,
  MdOutlineMarkEmailRead
} from 'react-icons/md';

const NotificationSystem = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const {
    hasNotifications,
    notificationCount,
    notifications,
    allNotifications,
    showAllNotifications,
    loading,
    markAsRead,
    markAllAsRead,
    toggleShowAllNotifications,
    generateTestNotification
  } = useNotifications();

  // Close notifications when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click to navigate to the appropriate page
  const handleNotificationClick = (notification) => {
    setShowNotifications(false); // Close the notification panel

    try {
      // Mark this notification as read if it's not already read
      if (!notification.read) {
        markAsRead(notification.id);
      }

      // Navigate based on notification type
      if (notification.route) {
        navigate(notification.route);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      if (notification.route) {
        navigate(notification.route);
      }
    }
  };

  // Format the time display
  const formatTime = (minutes) => {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="p-2 rounded-full bg-amber-400/10 hover:bg-amber-400/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        {hasNotifications ? (
          <div className="relative">
            <MdNotifications className="text-amber-700 size-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                {notificationCount}
              </span>
            )}
          </div>
        ) : (
          <MdNotificationsNone className="text-amber-700 size-5" />
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-amber-100 z-50">
          <div className="p-3 border-b border-amber-100 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">
              {showAllNotifications ? 'All Notifications' : 'Unread Notifications'}
            </h3>
            <button
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center"
              onClick={toggleShowAllNotifications}
            >
              {showAllNotifications ? (
                <>
                  <MdOutlineMarkEmailRead className="mr-1" /> Show Unread
                </>
              ) : (
                <>
                  <MdHistory className="mr-1" /> Show All
                </>
              )}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="flex justify-center items-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                  <p className="ml-2">Loading notifications...</p>
                </div>
              </div>
            ) : showAllNotifications ? (
              // Show all notifications (read and unread)
              allNotifications.length > 0 ? (
                allNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-amber-50 hover:bg-amber-50/50 transition-colors cursor-pointer ${
                      notification.severity === 'critical' ? 'bg-red-50/70' :
                      notification.severity === 'warning' ? 'bg-amber-50/70' : ''
                    } ${notification.read ? 'opacity-60' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type, notification.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                            {notification.message}
                          </p>
                          {notification.read && (
                            <span className="text-xs text-gray-400 ml-2">Read</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.time)}
                        </p>
                        {notification.resolved === false && notification.severity !== 'normal' && (
                          <span className="text-xs text-red-500 mt-1 block">
                            Unresolved issue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p>No notifications in the last 30 days</p>
                    <p className="text-xs mt-1">Your notification history is empty</p>
                  </div>
                </div>
              )
            ) : (
              // Show only unread notifications
              notificationCount > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-amber-50 hover:bg-amber-50/50 transition-colors cursor-pointer ${
                      notification.severity === 'critical' ? 'bg-red-50' :
                      notification.severity === 'warning' ? 'bg-amber-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type, notification.severity)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.time)}
                        </p>
                        {notification.resolved === false && notification.severity !== 'normal' && (
                          <span className="text-xs text-red-500 mt-1 block">
                            Unresolved issue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p>No new notifications</p>
                    <p className="text-xs mt-1">You're all caught up!</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="p-2 text-center border-t border-amber-100 flex justify-between">
            <button
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              onClick={() => {
                markAllAsRead();
                setShowNotifications(false);
              }}
            >
              Mark all as read
            </button>

            {/* View notification history link */}
            <button
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              onClick={() => {
                toggleShowAllNotifications();
              }}
            >
              {showAllNotifications ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
