import { Component } from '@angular/core';
import { SocketService } from './application/socket.service';
import { Message } from 'src/models/Message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  usernameInput = '';
  username = '';
  message = '';
  messages: Message[] = [];
  hasUsername = false;
  userCount = 0;
  updatedMessages: Message[] = [];
  usernameSet = true;

  constructor(private socketService: SocketService) {
    this.socketService.onMessage((message: Message) => {
      this.messages.push(message);
    });

    this.socketService.onUpdateMessages((updatedMessages: Message[]) => {
      this.messages = updatedMessages;
    });

    // Listen for user count updates from the server
    this.socketService.socket.on('updateUserCount', (count: number) => {
      this.userCount = count;
    });

    this.socketService.socket.on('usernameSet', (result: boolean) => {
      this.usernameSet = result;

      // Check if the username is set and unique, then show the chatbox
      if (result) {
        this.hasUsername = true;
      }
    });
  }

  setUsername() {
    if (this.usernameInput) {
      this.socketService.setUsername(this.usernameInput);
    }
  }

  sendMessage() {
    if (this.message.trim() !== '') {
      this.socketService.sendMessage(this.message);
      this.message = '';
    }
  }

  deleteMessage(messageId: string, userId: string) {
    const deletedMessage = this.messages.find(
      (message) => message.id === messageId && message.userId === userId
    );

    if (this.isMessageEditable(deletedMessage)) {
      this.socketService.deleteMessage(
        deletedMessage!.id,
        deletedMessage!.userId
      );
    }
  }

  isMessageEditable(message: Message | undefined): boolean {
    return message?.userId === this.socketService.socket.id;
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.userId === this.socketService.socket.id;
  }
}
