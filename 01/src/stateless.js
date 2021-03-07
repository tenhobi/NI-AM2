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

        if (!(groups = data.match(/([a-zA-Z]+)\s*(\d+)\s*(\d+)*$/m))) {
            socket.write("Warning: Wrong request syntax.\n");
            return;
        }

        switch (groups?.[1]) {
            case Request.OPEN:
                orderWorker.processOpen(socket, groups?.[2]);
                break;
            case Request.ADD:
                orderWorker.processAdd(socket, groups?.[2], groups?.[3]);
                break;
            case Request.PROCESS:
                orderWorker.processProcess(socket, groups?.[2]);
                break;
            default:
                socket.write("Error: Wrong request.\n")
        }
    });
});

server.listen(8124, function () { // start server (port 8124)
    console.log('server started');
});

class Order {
    constructor(id, state) {
        this.id = id;
        this.state = state;
        this.items = [];
    }
}

class OrderWorker {
    constructor(state = State.INITIAL) {
        this.state = state;
        this.orders = [];
    }

    processOpen(socket, orderId) {
        let order = this.orders.find(order => {
            return order.id === orderId;
        })
        if (order) {
            console.log(order);
            socket.write("Warning: Order ID already exists.\n");
            return;
        }

        this.orders.push(new Order(orderId, State.OPENED));
        socket.write(Response.OPENED + " order=" + orderId + "\n");
    }

    processAdd(socket, orderId, item) {
        let order = this.orders.find(order => {
            return order.id === orderId;
        })
        if (!order) {
            socket.write("Warning: Order cannot be found.\n");
            return;
        }

        if (order.state !== State.OPENED) {
            socket.write("Warning: You haven't opened your order yet.\n");
            return;
        }

        if (item) {
            order.items.push(item);
            socket.write(Response.ADDED + " order=" + orderId + ", item=" + item + "\n");
        } else {
            socket.write("Warning: You can only add item ids (integer).\n");
        }
    }

    processProcess(socket, orderId) {
        let order = this.orders.find(order => {
            return order.id === orderId;
        })
        if (!order) {
            socket.write("Warning: Order cannot be found.\n");
            return;
        }

        if (order.state !== State.OPENED) {
            socket.write("Warning: Not opened order cannot be processed.\n");
            return;
        }

        order.state = State.PROCESSED;
        socket.write(Response.PROCESSED + " order=" + orderId + " with items " + order.items.join(", ") + "\n");
    }
}
