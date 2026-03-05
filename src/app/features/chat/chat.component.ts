import { Component, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { ChatService, ChatMessage } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  template: `
    <div class="layout">
      <app-nav />
      <div class="chat-wrapper">
        <header class="chat-header">
          <div class="coach-info">
            <div class="coach-avatar">🤖</div>
            <div>
              <div class="coach-name">FitBro AI Coach</div>
              <div class="coach-status">Powered by DeepSeek V3</div>
            </div>
          </div>
        </header>

        <div class="messages" #scrollContainer>
          @if (messages().length === 0) {
            <div class="welcome-message">
              <div class="welcome-icon">💪</div>
              <h3>Hey there, champ!</h3>
              <p>I'm your AI fitness coach. I can help you log workouts, runs, meals, and track your progress. I remember everything about your fitness journey.</p>
              <div class="starter-chips">
                <button (click)="sendStarter('What does my fitness profile look like?')">View my profile</button>
                <button (click)="sendStarter('Show me my recent workout history')">Recent workouts</button>
                <button (click)="sendStarter('Log a workout for me')">Log a workout</button>
              </div>
            </div>
          }
          @for (msg of messages(); track $index) {
            <div class="message" [class]="msg.role">
              @if (msg.role === 'assistant') {
                <div class="msg-avatar">🤖</div>
              }
              <div class="msg-bubble">
                <div class="msg-content" [innerHTML]="formatMessage(msg.content)"></div>
                <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
              @if (msg.role === 'user') {
                <div class="msg-avatar user">{{ userInitial() }}</div>
              }
            </div>
          }
          @if (isTyping()) {
            <div class="message assistant">
              <div class="msg-avatar">🤖</div>
              <div class="msg-bubble">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="input-area">
          @if (error()) {
            <div class="chat-error">{{ error() }}</div>
          }
          <div class="input-row">
            <textarea
              [(ngModel)]="inputText"
              (keydown.enter)="onEnter($event)"
              placeholder="Message your AI coach..."
              rows="1"
              [disabled]="isTyping()"
              #textInput
            ></textarea>
            <button
              class="send-btn"
              (click)="send()"
              [disabled]="!inputText.trim() || isTyping()"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .chat-wrapper { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .chat-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; flex-shrink: 0; }
    .coach-info { display: flex; align-items: center; gap: 0.75rem; }
    .coach-avatar { width: 40px; height: 40px; background: rgba(0,212,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .coach-name { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; }
    .coach-status { font-size: 0.75rem; color: var(--accent); }
    .messages { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .welcome-message { text-align: center; padding: 3rem 2rem; }
    .welcome-icon { font-size: 3rem; margin-bottom: 1rem; }
    .welcome-message h3 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .welcome-message p { color: var(--text-muted); font-size: 0.9375rem; line-height: 1.6; max-width: 380px; margin: 0 auto 1.5rem; }
    .starter-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
    .starter-chips button { padding: 0.5rem 0.875rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; color: var(--text-primary); font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; }
    .starter-chips button:hover { border-color: var(--accent); color: var(--accent); }
    .message { display: flex; gap: 0.75rem; align-items: flex-end; }
    .message.user { flex-direction: row-reverse; }
    .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; background: rgba(0,212,255,0.15); }
    .msg-avatar.user { background: var(--accent); color: #000; font-weight: 700; font-size: 0.875rem; }
    .msg-bubble { max-width: 70%; }
    .message.user .msg-bubble { align-items: flex-end; display: flex; flex-direction: column; }
    .msg-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; border-bottom-left-radius: 4px; padding: 0.75rem 1rem; font-size: 0.9375rem; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word; }
    .message.user .msg-content { background: var(--accent); color: #000; border-color: var(--accent); border-radius: 16px; border-bottom-right-radius: 4px; border-bottom-left-radius: 16px; }
    .msg-time { font-size: 0.6875rem; color: var(--text-muted); margin-top: 0.25rem; padding: 0 0.25rem; }
    .typing-indicator { display: flex; gap: 4px; align-items: center; padding: 0.25rem 0; }
    .typing-indicator span { width: 7px; height: 7px; background: var(--accent); border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    .input-area { padding: 1rem 1.5rem; border-top: 1px solid var(--border); flex-shrink: 0; }
    .chat-error { color: #ff8080; font-size: 0.8125rem; margin-bottom: 0.5rem; }
    .input-row { display: flex; gap: 0.75rem; align-items: flex-end; }
    textarea { flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem 1rem; color: var(--text-primary); font-size: 0.9375rem; font-family: inherit; resize: none; min-height: 44px; max-height: 120px; transition: border-color 0.2s; }
    textarea:focus { outline: none; border-color: var(--accent); }
    textarea:disabled { opacity: 0.6; cursor: not-allowed; }
    .send-btn { width: 44px; height: 44px; background: var(--accent); border: none; border-radius: 12px; color: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }
    .send-btn:hover:not(:disabled) { opacity: 0.85; }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private readonly chatService = inject(ChatService);

  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  error = signal('');
  inputText = '';
  private shouldScroll = false;

  userInitial() {
    return 'U';
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onEnter(event: KeyboardEvent) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  sendStarter(text: string) {
    this.inputText = text;
    this.send();
  }

  send() {
    const text = this.inputText.trim();
    if (!text || this.isTyping()) return;

    this.error.set('');
    this.inputText = '';
    this.messages.update((msgs) => [...msgs, { role: 'user', content: text, timestamp: new Date() }]);
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.chatService.sendMessage(text).subscribe({
      next: (res: any) => {
        const reply = res?.output ?? res?.text ?? res?.response ?? JSON.stringify(res);
        this.messages.update((msgs) => [...msgs, { role: 'assistant', content: reply, timestamp: new Date() }]);
        this.isTyping.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.isTyping.set(false);
        this.error.set('Failed to send message. Please try again.');
      }
    });
  }

  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
