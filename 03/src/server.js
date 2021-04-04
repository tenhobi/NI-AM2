const http = require('http');
const url = require('url');

http.createServer((req, res) => {
  const helloValue = url.parse(req.url,true).pathname.substring(1);

  if (helloValue === 'favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }

  console.log(`Saying hello to ${helloValue}`)
  res.end(`Hello ${helloValue}\n`);
}).listen(8888);
