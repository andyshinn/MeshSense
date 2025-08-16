```
let node = 1525234494; // Tommy

async function sendMessages(node) {
  for (let i = 1; i <= 10; i++) {
    await fetch('/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `T${i}`,
        destination: node,
        wantAck: true
      })
    });
    console.log(`Sending test to ${node} (T${i})`);
    if (i < 10) await new Promise(res => setTimeout(res, 30000)); // 30 seconds
  }
}
sendMessages(node);
```
