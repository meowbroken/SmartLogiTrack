import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UnansweredChat {
  id: number;
  customer_input: string;
  staff_reply?: string;
  resolved: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-admin-messages',
  standalone: false,
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.css']
})
export class AdminMessagesComponent implements OnInit {
  chats: UnansweredChat[] = [];
  selectedChat?: UnansweredChat;
  adminReply: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.loading = true;
    this.http.get<UnansweredChat[]>('http://127.0.0.1:8000/chat/unanswered/')
      .subscribe({
        next: data => {
          this.chats = data;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load chats';
          this.loading = false;
        }
      });
  }

  selectChat(chat: UnansweredChat) {
    this.selectedChat = chat;
    this.adminReply = '';
    this.error = '';
  }

  sendReply() {
    if (!this.selectedChat || !this.adminReply.trim()) return;
    this.loading = true;
    this.http.patch(`http://127.0.0.1:8000/chat/reply/${this.selectedChat.id}/`, { staff_reply: this.adminReply })
      .subscribe({
        next: () => {
          this.selectedChat!.staff_reply = this.adminReply;
          this.selectedChat!.resolved = true;
          this.adminReply = '';
          this.loading = false;
          this.loadChats();
        },
        error: err => {
          this.error = 'Failed to send reply';
          this.loading = false;
        }
      });
  }
}