"use strict"
const Elm = require("./elm.js");

let container = document.getElementById("container");
let app = Elm.Main.embed(container);

// SSE
var es = new EventSource("http://localhost:51337/sse");
es.onmessage = event => {
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
})
