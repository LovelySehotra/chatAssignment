import { io } from 'socket.io-client';

const socket = io('http://localhost:1209');

socket.on('connect', () => {
  console.log('CONNECTED');

  console.log(socket.id);
});

socket.on('connect_error', err => {
  console.log(err);
});