import React from "react";
import Map from "./Components/Map";
import OfflineNotification from "./Components/OfflineNotification ";

function App() {
  const isOffline = !navigator.onLine;

  return <div>{isOffline ? <OfflineNotification /> : <Map />}</div>;
}

export default App;
