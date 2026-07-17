type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  constructor() {
    this.url = `ws://${window.location.hostname}:3001`;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const typeHandlers = this.handlers.get(data.type);
          if (typeHandlers) {
            typeHandlers.forEach((handler) => handler(data));
          }
          const allHandlers = this.handlers.get('*');
          if (allHandlers) {
            allHandlers.forEach((handler) => handler(data));
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting in 5s...');
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  notify(type: string, payload: any) {
    this.send({ type, ...payload });
  }
}

export const wsService = new WebSocketService();