const http = require('http');
const url = require('url');
const redis = require('redis');

var client = redis.createClient({
  host: 'redis'
});

/// Redis

client.on('connect', function() {
  console.log('Redis client connected');
});

client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

/// HTTP server

http.createServer((req, res) => {
  const pathArray = url.parse(req.url,true).pathname.substring(1).split('/');

  console.log(`${pathArray}`)

  if (pathArray.length != 3 || pathArray[0] != 'person' || pathArray[2] != 'address') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }

  let name = pathArray[1];

  client.get(name, function (error, result) {
    if (error || result == null) {
        console.log(`Address not found for '${name}'\n`);
        res.end(`Address not found for '${name}'\n`);
        return;
    }

    console.log(`Address is '${result}'\n`);
    res.end(`Address is '${result}'\n`);
  });
}).listen(8888);
