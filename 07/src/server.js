const http = require('http');

const server = http.createServer((request, response) => {
  response.writeHead(200, {
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // fast fix to debug on localhost
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });

  let id = 1;

  // Event streaming.
  setInterval(() => {
    response.write(
      `event: bittnja3Event\nid: ${id}\ndata: Sending bittnja3 event #${id}.\n\n`
    );
    console.log(id);
    id++;
  }, 2 * 1000);
});

// Listen.
server.listen(8888);
