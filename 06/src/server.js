const http2 = require('http2');
const fs = require('fs');
const mime = require('mime');

// Set up server.
const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
});

const { HTTP2_HEADER_PATH } = http2.constants

// On error.
server.on('error', (err) => console.error(err));

function push (stream, filePath, fileName) {
  console.log("pushing " + fileName);

  const fileDescriptor = fs.openSync(filePath, "r");
  const fileStat = fs.fstatSync(fileDescriptor);
  const contentType = mime.getType(filePath);
  const fileHeaders = {
    "content-length": fileStat.size,
    "last-modified": fileStat.mtime.toUTCString(),
    "content-type": contentType,
  };
  stream.respondWithFD(fileDescriptor, fileHeaders);

  stream.pushStream({ ":path": filePath }, (pushStream) => {
    pushStream.respondWithFD(file, headers);
    pushStream.on("close", () => {
      console.log("responded with file ", fileName);
      fs.closeSync(fileDescriptor);
    });
    pushStream.end();
  });
}

// On stream.
server.on('stream', (stream, headers) => {
  // Push all static directory.
  const files = fs.readdirSync(__dirname + "/static");
  for (let i = 0; i < files.length; i++) {
    const fileName = "/static/" + files[i];
    const filePath = __dirname + fileName;
    push(stream, filePath, fileName);
  }

  // Push index file.
  push(stream, "/index.html", "index.html");
});

// Listen.
server.listen(8888);
