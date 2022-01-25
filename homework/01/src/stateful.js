let net = require('net');

const Request = {
    OPEN: "open",
    ADD: "add",
    PROCESS: "process",
}

const Response = {
    OPENED: "opened",
    ADDED: "added",
    PROCESSED: "processed",
}

const State = {
    INITIAL: "initial",
    OPENED: "opened",
    PROCESSED: "processed",
}

let server = net.createServer((socket) => {
    let orderWorker = new OrderWorker();

    socket.setEncoding('utf8');

    socket.on('connect', (data) => {
        console.log('connect');
        socket.write(data);
    });

    socket.on('end', () => {
        console.log('connection/socket closed');
    });

    socket.on('data', (data) => {
        let groups;

        if (!(groups = data.match(/([a-zA-Z]+)\s*(\d+)*$/m))) {
            socket.write("Warning: Wrong request syntax.\n");
            return;
        }

        switch (groups?.[1]) {
            case Request.OPEN:
                orderWorker.processOpen(socket);
                break;
            case Request.ADD:
                orderWorker.processAdd(socket, groups?.[2]);
                break;
            case Request.PROCESS:
                orderWorker.processProcess(socket);
                break;
            default:
                socket.write("Error: Wrong request.\n")
        }
    });
});

server.listen(8124, function () { // start server (port 8124)
    console.log('server started');
});

class OrderWorker {
    constructor(state = State.INITIAL) {
        this.state = state;
        this.items = [];
    }

    processOpen(socket) {
        if (this.state !== State.INITIAL && this.state !== State.PROCESSED) {
            socket.write("Warning: You have already opened request.\n");
            return;
        }

        this.state = State.OPENED;
        this.items = [];
        socket.write(Response.OPENED + "\n");
    }

    processAdd(socket, item) {
        if (this.state !== State.OPENED) {
            socket.write("Warning: You haven't opened your order yet.\n");
            return;
        }

        if (item) {
            this.items.push(item);
            socket.write(Response.ADDED + " " + item + "\n");
        } else {
            socket.write("Warning: You can only add item ids (integer).\n");
        }
    }

    processProcess(socket) {
        if (this.state !== State.OPENED) {
            socket.write("Warning: You haven't opened your order yet.\n");
            return;
        }

        this.state = State.PROCESSED;
        socket.write(Response.PROCESSED + " with items " + this.items.join(", ") + "\n");
    }
}
