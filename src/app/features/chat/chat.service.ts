import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  sendMessage(message: string): Observable<any> {
    const userId = this.auth.user()?.id ?? '';
    return this.http.post(
      `${environment.n8nBaseUrl}/webhook/${environment.n8nChatWebhookId}/chat`,
      {
        action: 'sendMessage',
        sessionId: userId,
        chatInput: message,
      }
    );
  }
}
