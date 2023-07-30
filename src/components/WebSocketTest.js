import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const WebSocketTest = () => {
  const [message, setMessage] = useState('');
  const [receivedMessage, setReceivedMessage] = useState('');

  useEffect(() => {
    const socket = socketIOClient('ws://localhost:8080');

    // Listen for 'message' event from the server
    socket.on('message', (data) => {
      console.log('Received a message from the server:', data);
      setReceivedMessage(data);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    const socket = socketIOClient('ws://localhost:8080');
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div>
      <h1>WebSocket Test</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send Message</button>
      <p>Received Message: {receivedMessage}</p>
    </div>
  );
};

export default WebSocketTest;