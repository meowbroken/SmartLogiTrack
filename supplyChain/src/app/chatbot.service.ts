import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SentimentResponse {
  response: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'info' | 'not_found';
  polarity?: number;
  needs_staff?: boolean;
  interaction_id?: number;
  learned?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://127.0.0.1:8000/feedback/sentiment/';

  constructor(private http: HttpClient) {}

  analyzeFeedback(feedback: string): Observable<SentimentResponse> {
    return this.http.post<SentimentResponse>(this.apiUrl, { feedback });
  }
}