import { createContext, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  
  const socket = socketIOClient('ws://localhost:8080');

  // Connect to the websocket when the component mounts
  useEffect(() => {
    
    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );

};

export { WebSocketContext, WebSocketProvider };

