import { createContext, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  
  const socket = socketIOClient('ws://localhost:8080');

  const lastClickedID = useRef(null);

  // Connect to the websocket when the component mounts
  useEffect(() => {
    
    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ socket, lastClickedID }}>
      {children}
    </WebSocketContext.Provider>
  );

};

export { WebSocketContext, WebSocketProvider };

