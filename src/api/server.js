
const http = require("http");
const express = require("express");
var SSE = require('sse');

const api = require("./index.js");

const apiRouter = express.Router();


// Body management setup

apiRouter.use((req, res, next) => {
	console.log(req.url);
	next();
});
apiRouter.use((req, res, next) => {
	var body = [];
	req.on('data', (chunk) => body.push(chunk));
	req.on('end', () => {
		var rawBody = Buffer.concat(body).toString();
		try {
			req.body = JSON.parse(rawBody);
		}
		catch(e) {
            req.body = {};
		}
        next();
	});
});


// Endpoints

apiRouter.get("/getBids", (req, res, next) => {
    api.getBids().then((bids) => {
        next(bids);
    });
});
apiRouter.post("/addBid", (req, res, next) => {
    api.addBid(req.body).then(() => {
        // Avkommentera för konstgjord fördröjning
        //setTimeout(() => next({}), 1000);
        next({});
    });
});
apiRouter.post("/acceptBid", (req, res, next) => {
    if(req.body.clientID < 0) {
        next(400);
    }
    else {
        api.acceptBid(req.body.id).then(() => {
            sendSSE(req.body.clientID, {
                cmd: "acceptBidResponse",
                status: "ok",
            });
        });
        next({});
    }
});
apiRouter.get("/getWallet", (req, res, next) => {
	api.getWallet().then((accounts) => {
		next(accounts);
	});
});
apiRouter.get("/getUserBids", (req, res, next) => {
	api.getUserBids().then((bids) => {
		next(bids);
	});
});


// Server stuff

apiRouter.get("/*", (req, res, next) => {
	next(404);
});
apiRouter.use((prev, req, res, next) => {
    var response;
    var code;

    if(typeof prev === "number") {
        code = prev;
        response = {};
    }
    else {
        code = 200;
        response = prev;
    }
    res.status(code);
    res.type("application/json");
    res.send(JSON.stringify(response));
    res.end();
});

var sseClients = [];
function setupSSE() {
	var sse = new SSE(server);
	sse.on("connection", (client) => {
		sseClients.push(client);
		const id = sseClients.length - 1;
		sendSSE(id, {
			cmd: "ack",
			clientID: id,
		});
	});
}
function sendSSE(id, data) {
	const client = sseClients[id];
	if(client) {
		client.send(JSON.stringify(data));
	}
}

const app = express();
app.use("/api", apiRouter);

const server = http.createServer(app);
server.listen(51337, "localhost", () => {
    console.log("Daemon is now running");
	setupSSE();
});
