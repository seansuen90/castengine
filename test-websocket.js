import WebSocket from 'ws';

const SERVER_URL = process.env.WS_SERVER || 'ws://localhost:8000/ws';
const NUM_CONNECTIONS = 60;

console.log(`Testing WebSocket connection to ${SERVER_URL}...\n`);

let connectedCount = 0;
let closedCount = 0;

for (let i = 0; i < NUM_CONNECTIONS; i++) {
  const ws = new WebSocket(SERVER_URL);
  
  ws.onopen = () => {
    connectedCount++;
    console.log(`Socket ${i} opened (${connectedCount}/${NUM_CONNECTIONS} connected)`);
  };
  
  ws.onclose = (e) => {
    closedCount++;
    console.log(`Socket ${i} closed: ${e.code} ${e.reason}`);
  };
  
  ws.onerror = (error) => {
    console.error(`Socket ${i} error:`, error.message);
  };
  
  ws.onmessage = (e) => {
    console.log(`Socket ${i} received:`, e.data);
  };
}

// Close all connections after 5 seconds
setTimeout(() => {
  console.log('\nTest complete. Total closed:', closedCount);
  process.exit(0);
}, 50000);
