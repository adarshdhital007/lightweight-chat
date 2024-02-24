import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket;

  constructor() {
    this.socket = io('https://socketchat-8ink.onrender.com', {
      transports: ['websocket'],
    });
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  sendMessage(message: string) {
    this.socket.emit('message', message);
  }

  setUsername(username: string) {
    this.socket.emit('setUsername', username);
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('message', (message: any) => {
      callback(message);
    });
  }

  deleteMessage(messageId: string, userId: string) {
    this.socket.emit('deleteMessage', { messageId, userId });
  }

  onUpdateMessages(callback: (updatedMessages: any[]) => void) {
    this.socket.on('updateMessages', (updatedMessages: any[]) => {
      callback(updatedMessages);
    });
  }
}
