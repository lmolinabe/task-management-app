import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const appBackendUrl = process.env.APP_BACKEND_URL || 'http://localhost:5000'; 

const Notifications = () => {
  const [socket, setSocket] = useState(null);
  const { user, onTokenRefresh  } = useContext(AuthContext);

  useEffect(() => {
    const connectSocket = (token) => {
      const newSocket = io(appBackendUrl, {
        query: { token },
      });

      newSocket.emit('joinRoom', user._id.toString());

      // Listen for 'dueSoonNotification' event
      newSocket.on('dueSoonNotification', (task) => {
        if (user.notifications && user.notifications.dueSoon) {
            toast(`Task "${task.title}" is due soon!`, {
                icon: '⏰', // Optional icon
                duration: 6000, // Display for 6 seconds (6000 milliseconds)
                position: 'bottom-right'
            });
        }
      });

      // Listen for 'overdueNotification' event
      newSocket.on('overdueNotification', (task) => {
        if (user.notifications && user.notifications.overdue) {
            toast.error(`Task "${task.title}" is overdue!`, {
                icon: '⚠️', // Optional icon
                duration: 8000, // Display for 8 seconds (8000 milliseconds)
                position: 'bottom-right'
            });
        }
      });

      setSocket(newSocket);
    };
    
    const areNotificationsEnabled = () => 
      user && user.notifications && (user.notifications.dueSoon || user.notifications.overdue);
  
    // Connect or reconnect the socket based on notification preferences
    if (areNotificationsEnabled() && !socket) { // Connect if enabled and no socket
      connectSocket(user.accessToken);
    } else if (!areNotificationsEnabled() && socket) { // Disconnect if disabled and socket exists
      socket.disconnect();
      setSocket(null);
    }    

    // Listen for token refresh
    const handleTokenRefresh = () => {
      const newToken = user.accessToken; // Get the new token from the context
      if (socket) {
        socket.disconnect(); // Disconnect the old socket
        setSocket(null); // Clear the old socket
      }
      connectSocket(newToken); // Connect with the new token
    };

    onTokenRefresh.addEventListener('tokenRefreshed', handleTokenRefresh);
  }, [user, onTokenRefresh]); 

  return (
    <div>
      <Toaster /> {/* Render the toast container */}
    </div>
  );
};

export default Notifications;