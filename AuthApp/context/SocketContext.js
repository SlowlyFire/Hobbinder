import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CLIENT_IP, SOCKET_PORT } from '@env';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(io(`http://${CLIENT_IP}:${SOCKET_PORT}`));

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};