import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit, Timestamp, onSnapshot, deleteDoc, writeBatch, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '../firebaseConfig';
import {
  MdWarning,
  MdShoppingCartCheckout,
  MdFeedback,
  MdOutlineInventory2,
  MdErrorOutline
} from 'react-icons/md';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Map notification types to their icons
export const getNotificationIcon = (type, severity) => {
  switch (type) {
    case 'order':
      return <MdShoppingCartCheckout className="text-green-600" />;
    case 'inventory':
      return severity === 'critical'
        ? <MdErrorOutline className="text-red-600" />
        : severity === 'warning'
          ? <MdWarning className="text-amber-600" />
          : <MdOutlineInventory2 className="text-purple-600" />;
    case 'customer':
      return <MdFeedback className="text-blue-600" />;
    default:
      return <MdWarning className="text-gray-600" />;
  }
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile, hasAccess, isAdmin } = useAuth();
  const db = getFirestore(firebaseApp);

  // Generate a test notification (for development)
  const generateTestNotification = async (type = 'order') => {
    if (!currentUser) return;

    const notificationTypes = {
      order: {
        type: 'order',
        message: 'New order received',
        severity: 'normal',
        route: '/orders/pending-transactions',
        module: 'orders',
        resolved: true
      },
      inventory_low: {
        type: 'inventory',
        message: 'Inventory low alert',
        severity: 'warning',
        route: '/inventory/daily-inventory',
        module: 'inventory',
        resolved: false
      },
      inventory_critical: {
        type: 'inventory',
        message: 'Critical inventory shortage',
        severity: 'critical',
        route: '/inventory/daily-inventory',
        module: 'inventory',
        resolved: false
      },
      customer: {
        type: 'customer',
        message: 'Customer feedback received',
        severity: 'normal',
        route: '/customer/overview',
        module: 'customer',
        resolved: true
      },
      inventory_update: {
        type: 'inventory',
        message: 'Inventory has been updated',
        severity: 'normal',
        route: '/inventory/daily-inventory',
        module: 'inventory',
        resolved: true
      }
    };

    const notificationData = {
      ...notificationTypes[type],
      userId: currentUser.uid,
      read: false,
      createdAt: Timestamp.now(),
      // For demo purposes, we'll set some notifications to be a few minutes old
      displayTime: Math.floor(Math.random() * 60) // Random minutes ago
    };

    try {
      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Test notification added');
    } catch (error) {
      console.error('Error adding test notification:', error);
    }
  };

  // Fetch notifications from Firestore - GLOBAL VERSION
  const fetchNotifications = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching global notifications");

      // Create a query for all unread notifications (global approach)
      const q = query(
        collection(db, 'notifications'),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener for notifications
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log("Notification snapshot received, count:", querySnapshot.docs.length);
        const notificationsData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Check if this notification has already been read by this user
          const readBy = data.readBy || [];
          const alreadyReadByCurrentUser = readBy.includes(currentUser.uid);

          // Skip if already read by this user
          if (alreadyReadByCurrentUser) {
            console.log(`Notification ${doc.id} already read by current user, skipping`);
            return;
          }

          // Include global notifications or notifications specifically for this user
          if (data.global === true || data.userId === currentUser.uid || data.userId === 'global') {
            // Check if user has access to this module
            if (isAdmin() || hasAccess(data.module)) {
              console.log("Including notification:", doc.id, data.message);
              notificationsData.push({
                id: doc.id,
                ...data,
                // Calculate time difference for display
                time: data.displayTime || Math.floor((Timestamp.now().toMillis() - data.createdAt.toMillis()) / 60000)
              });
            }
          }
        });

        console.log("Total notifications after filtering:", notificationsData.length);
        setNotifications(notificationsData);
        setNotificationCount(notificationsData.length);
        setHasNotifications(notificationsData.length > 0);
        setLoading(false);
      }, (error) => {
        // Handle errors in the snapshot listener
        console.error('Error in notification listener:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
      return null;
    }
  };

  // Fetch all notifications (including read ones) - GLOBAL VERSION
  const fetchAllNotifications = async () => {
    if (!currentUser) return [];

    try {
      console.log("Fetching all global notifications");

      // Create a query for all notifications (global approach)
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit to last 50 notifications
      );

      const querySnapshot = await getDocs(q);
      console.log("All notifications snapshot received, count:", querySnapshot.docs.length);
      const notificationsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Check if this notification has been read by this user
        const readBy = data.readBy || [];
        const alreadyReadByCurrentUser = readBy.includes(currentUser.uid);

        // Include global notifications or notifications specifically for this user
        if (data.global === true || data.userId === currentUser.uid || data.userId === 'global') {
          // Check if user has access to this module
          if (isAdmin() || hasAccess(data.module)) {
            console.log("Including notification in history:", doc.id, data.message);
            notificationsData.push({
              id: doc.id,
              ...data,
              // Calculate time difference for display
              time: data.displayTime || Math.floor((Timestamp.now().toMillis() - data.createdAt.toMillis()) / 60000),
              // Mark as read if it's in the readBy array for this user
              read: alreadyReadByCurrentUser
            });
          }
        }
      });

      console.log("Total notifications in history after filtering:", notificationsData.length);
      setAllNotifications(notificationsData);
      return notificationsData;
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return [];
    }
  };

  // Mark all notifications as read - GLOBAL VERSION
  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;

    try {
      console.log("Marking all notifications as read - global approach");

      // We need to handle global and personal notifications differently
      // First, get all the notification documents
      const notificationDocs = await Promise.all(
        notifications.map(async (notification) => {
          const notificationRef = doc(db, 'notifications', notification.id);
          const docSnap = await getDoc(notificationRef);
          return {
            id: notification.id,
            ref: notificationRef,
            data: docSnap.exists() ? docSnap.data() : null
          };
        })
      );

      // Create a batch write
      const batch = writeBatch(db);

      // Process each notification
      notificationDocs.forEach(({ id, ref, data }) => {
        if (!data) {
          console.log(`Notification ${id} not found, skipping`);
          return;
        }

        // For global notifications, we only add the user to readBy array but don't mark the entire notification as read
        if (data.global === true || data.userId === 'global') {
          batch.update(ref, {
            readBy: arrayUnion(currentUser.uid),
            lastReadAt: Timestamp.now()
          });
          console.log(`Added user ${currentUser.uid} to readBy array for global notification ${id}`);
        } else {
          // For personal notifications, mark as fully read
          batch.update(ref, {
            read: true,
            readBy: arrayUnion(currentUser.uid),
            lastReadAt: Timestamp.now()
          });
          console.log(`Marked personal notification ${id} as read`);
        }
      });

      // Commit the batch
      await batch.commit();
      console.log(`Processed ${notifications.length} notifications`);

      // Update local state
      setNotificationCount(0);
      setHasNotifications(false);
      setNotifications([]);

      // Refresh all notifications list if it's being displayed
      if (showAllNotifications) {
        fetchAllNotifications();
      }

      console.log("Successfully marked all notifications as read");
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Mark a specific notification as read - GLOBAL VERSION
  const markAsRead = async (notificationId) => {
    if (!currentUser) return;

    try {
      console.log("Marking notification as read:", notificationId);

      // Get the notification document first
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);

      if (!notificationDoc.exists()) {
        console.error("Notification not found:", notificationId);
        return;
      }

      const notificationData = notificationDoc.data();

      // For global notifications, we only add the user to readBy array but don't mark the entire notification as read
      if (notificationData.global === true || notificationData.userId === 'global') {
        await updateDoc(notificationRef, {
          readBy: arrayUnion(currentUser.uid),
          lastReadAt: Timestamp.now()
        });
        console.log(`Added user ${currentUser.uid} to readBy array for global notification`);
      } else {
        // For personal notifications, mark as fully read
        await updateDoc(notificationRef, {
          read: true,
          readBy: arrayUnion(currentUser.uid),
          lastReadAt: Timestamp.now()
        });
      }

      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );

      setNotifications(updatedNotifications);
      setNotificationCount(updatedNotifications.length);
      setHasNotifications(updatedNotifications.length > 0);

      // Refresh all notifications list if it's being displayed
      if (showAllNotifications) {
        fetchAllNotifications();
      }

      console.log("Successfully marked notification as read");
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle showing all notifications
  const toggleShowAllNotifications = async () => {
    const newState = !showAllNotifications;
    setShowAllNotifications(newState);

    if (newState && allNotifications.length === 0) {
      await fetchAllNotifications();
    }
  };

  // Delete a notification (for admin purposes)
  const deleteNotification = async (notificationId) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'notifications', notificationId));

      // Update local states
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setAllNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update counts if it was an unread notification
      const wasUnread = notifications.some(n => n.id === notificationId);
      if (wasUnread) {
        setNotificationCount(prev => prev - 1);
        setHasNotifications(notificationCount - 1 > 0);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Set up notification listeners when user changes
  useEffect(() => {
    let unsubscribe = null;
    let loadingTimeout = null;
    let refreshInterval = null;

    if (currentUser) {
      console.log("Setting up notification listener for user:", currentUser.uid);
      setLoading(true);

      // Set a timeout to stop loading state after 5 seconds if it's taking too long
      loadingTimeout = setTimeout(() => {
        console.log("Notification loading timeout reached, forcing loading state to false");
        setLoading(false);
      }, 5000);

      // Force a refresh of notifications every 5 seconds (more frequent)
      refreshInterval = setInterval(() => {
        console.log("Refreshing notifications...");
        fetchNotifications().catch(error => {
          console.error('Error refreshing notifications:', error);
        });
      }, 5000); // Reduced from 10000 to 5000 ms

      fetchNotifications().then(unsub => {
        if (unsub) {
          console.log("Notification listener set up successfully");
          unsubscribe = unsub;
        }
        else {
          console.log("No unsubscribe function returned from fetchNotifications");
          setLoading(false);
        }

        // Clear the timeout if we got a response
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
      }).catch(error => {
        console.error('Error setting up notification listener:', error);
        setLoading(false);

        // Clear the timeout if we got an error
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
      });
    } else {
      console.log("No user logged in, clearing notifications");
      setNotifications([]);
      setAllNotifications([]);
      setNotificationCount(0);
      setHasNotifications(false);
      setLoading(false);
    }

    return () => {
      console.log("Cleaning up notification listener");
      if (unsubscribe) {
        console.log("Unsubscribing from notification listener");
        unsubscribe();
      }
      if (loadingTimeout) {
        console.log("Clearing loading timeout");
        clearTimeout(loadingTimeout);
      }
      if (refreshInterval) {
        console.log("Clearing refresh interval");
        clearInterval(refreshInterval);
      }
    };
  }, [currentUser, userProfile]);

  // Value to be provided to consumers
  const value = {
    hasNotifications,
    notificationCount,
    notifications,
    allNotifications,
    showAllNotifications,
    loading,
    markAllAsRead,
    markAsRead,
    toggleShowAllNotifications,
    generateTestNotification,
    deleteNotification,
    fetchAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
