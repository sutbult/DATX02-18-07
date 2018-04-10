"use strict"
const Elm = require("./elm.js");

let container = document.getElementById("container");
let app = Elm.Main.embed(container);

var es = new EventSource("http://localhost:51337/sse");
es.onmessage = (event) => {
    var msg = JSON.parse(event.data);
    switch(msg.cmd) {
        case "ack":
            app.ports.getSSEId.send(msg.clientID);
            break;

        case "acceptBidResponse":
            app.ports.acceptBidResponse.send(msg.status);
            break;

        case "updateBids":
            // TODO: Implementera port
            console.log("Uppdatera bud!");
            break;
    }
}
