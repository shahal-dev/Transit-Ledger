import { nanoid } from 'nanoid';

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
// Flag to prevent duplicate websocket initialization
let isInitializing = false;
const RECONNECT_DELAY = 1000;

export function setupWebSocket() {
  // Prevent multiple simultaneous initialization attempts
  if (ws || isInitializing) {
    return;
  }
  
  isInitializing = true;

  try {
    // Explicitly set the protocol and host with clear fallbacks
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // In development, always use localhost:5000
    // In production, use the current host but always with port 5000
    const host = import.meta.env.DEV 
      ? 'localhost:5000' 
      : `${window.location.hostname}:5000`;
    
    // Generate a token for the connection
    const token = nanoid();
    
    // Construct the WebSocket URL with the path /ws
    const wsUrl = `${protocol}//${host}/ws?token=${token}`;

    console.log('Attempting WebSocket connection to:', wsUrl);

    // Create a new WebSocket connection
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      isInitializing = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
      ws = null;
      isInitializing = false;
      
      // Attempt to reconnect after delay
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(setupWebSocket, RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      isInitializing = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    isInitializing = false;
    
    // Attempt to reconnect after delay
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(setupWebSocket, RECONNECT_DELAY);
  }
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
  isInitializing = false;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
} 