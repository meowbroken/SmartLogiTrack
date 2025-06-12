import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotService } from '../chatbot.service';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  sender: string;
  text: string;
  isHtml?: boolean;
  timestamp?: Date;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'info' | 'not_found';
}

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  messages: ChatMessage[] = [];
  userInput: string = '';

  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.showWelcome();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  showWelcome() {
    const welcomeMsg = `<div>
      <b>Welcome! How can I assist you today?</b><br>
      Here are some things you can ask me:
      <ul>
        <li>Can you track order 123?</li>
        <li>Thank you, your service was excellent!</li>
        <li>I'm not happy with my last order.</li>
        <li>Show me recent supply chain alerts.</li>
      </ul>
    </div>`;
    this.messages.push({ sender: 'bot', text: welcomeMsg, isHtml: true, timestamp: new Date() });
  }

  async sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ sender: 'user', text: message, timestamp: new Date() });

    try {
      const sentimentRes = await firstValueFrom(this.chatbotService.analyzeFeedback(message));

      let botReply = sentimentRes.response;
      if (sentimentRes.sentiment === 'negative') {
        botReply = "We are sorry to hear that. A staff member will assist you shortly.";
      }

      this.messages.push({
        sender: 'bot',
        text: botReply,
        timestamp: new Date(),
        sentiment: sentimentRes.sentiment
      });

    } catch {
      this.messages.push({
        sender: 'bot',
        text: 'Sorry, I could not analyze your feedback at this time.',
        timestamp: new Date()
      });
    }

    this.userInput = '';
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesEnd) {
        this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {}
  }
}