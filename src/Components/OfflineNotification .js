import { useState, useEffect } from "react";
import "./OfflineNotification.css";

//! This will display a message when the user is offline. This will be used in the App component.
const OfflineNotification = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline ? (
    <div className="offline-notification">You are currently offline.</div>
  ) : null;
};

export default OfflineNotification;
