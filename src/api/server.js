
const http = require("http");
const express = require("express");

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
        next({});
    });
});
apiRouter.post("/acceptBid", (req, res, next) => {
    api.acceptBid(req.body).then(() => {
        next({});
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

const app = express();
app.use("/api", apiRouter);

const server = http.createServer(app);
server.listen(51337, "localhost", () => {
    console.log("Daemon is now running");
});
