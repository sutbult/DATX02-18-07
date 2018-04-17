const http = require("http");
const express = require("express");
var SSE = require('sse');

const api = require("./index.js");


// Endpoint handlers

function respond(res, code, response) {
    res.status(code);
    res.type("application/json");
    res.send(JSON.stringify(response));
    res.end();
}
const apiRouter = express.Router();

function createMethod(method) {
    return (path, handler) => {
        apiRouter[method](path, (req, res) => {
            function onSuccess(data) {
                respond(res, 200, data || {});
            }
            function onError(error) {
                if(typeof error === "number") {
                    respond(res, error, {});
                }
                else {
                    respond(res, 500, {
                        error,
                    });
                }
            }
            handler(req.body)
                .then(onSuccess)
                .catch(onError);
        });
    }
}
const get = createMethod("get");
const post = createMethod("post");


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


// Get endpoints

get("/getBids", api.getBids);
get("/getWallet", api.getWallet);
get("/getUserBids", api.getUserBids);
get("/getCurrencies", api.getCurrencies);


// Post endpoints

post("/addBid", api.addBid);
post("/acceptBid", async body => {
    if(body.clientID < 0) {
        throw 400;
    }
    else {
        api.acceptBid(body.id)
            .then(() => {
                sendSSE(body.clientID, {
                    cmd: "acceptBidResponse",
                    status: "ok",
                });
            })
            .catch(error => {
                sendSSE(body.clientID, {
                    cmd: "acceptBidResponse",
                    status: "error",
                    error,
                });
            });
    }
});


// 404

const promise404 = async () => {
    throw 404
};
get("/*", promise404);
post("/*", promise404);


// SSE

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
api.setMessageHandler(message => {
    for(var id in sseClients) {
        sendSSE(id, message);
    }
});

const app = express();
app.use("/api", apiRouter);

const server = http.createServer(app);
server.listen(51337, "localhost", () => {
    console.log("Daemon is now running");
	setupSSE();
});
