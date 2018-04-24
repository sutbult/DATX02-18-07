"use strict"
const Elm = require("./elm.js");
const child_process = require("child_process");
const electron = require("electron");
const path = require("path");

const development = electron.remote.getCurrentWindow().custom.development;

const apiNode = "./node_modules/node/bin/node";
const apiMain = "./src/server.js";
const apiCwd = development
    ? "../api"
    : path.join(__dirname, "../../../packages/api/")
    ;

function startAPI() {
    return new Promise((resolve, reject) => {
        const api = child_process.spawn(apiNode, [apiMain], {
            cwd: apiCwd
        });
        function kill() {
            api.kill();
        }
        api.stdout.on("data", data => {
            const msg = data.toString("utf-8");
            if(msg.startsWith("Daemon is now running")) {
                resolve();
            }
            else {
                console.log("API: %s", msg);
            }
        });
        api.stderr.on("data", data => {
            const msg = data.toString("utf-8");
            console.error("API: %s", msg);
            reject(msg);
        });
        api.on("close", code => {
            console.log("API exited with code %s", code);
        });
        process.on("exit", kill);
        window.addEventListener("beforeunload", kill);
    });
}

let container = document.getElementById("container");
let app = Elm.Main.embed(container);

// SSE
function onSSEmessage(event) {
    var msg = JSON.parse(event.data);
    switch(msg.cmd) {
        case "ack":
            app.ports.getSSEId.send(msg.clientID);
            break;

        case "acceptBidResponse":
            app.ports.acceptBidResponse.send(msg.status);
            break;

        case "updateBids":
            app.ports.updateBids.send(null);
            break;
    }
}
function setupSSE() {
    var es = new EventSource("http://localhost:51337/sse");
    es.onmessage = onSSEmessage;
}

// Mouse movements
document.onmousemove = e => {
    app.ports.mouseMove.send([e.clientX, e.clientY]);
}

// Notifications
app.ports.notify.subscribe((content) => {
    const title = content[0];
    const body = content[1];

    new Notification(title, {
        body,
    });
});

startAPI()
    .then(() => {
        setupSSE();
        app.ports.apiStarted.send(null);
    })
    .catch(error => {
        console.error("The API server could not be started");
    });
