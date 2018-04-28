"use strict"
const Elm = require("../build/elm.js");
const child_process = require("child_process");
const electron = require("electron");
const startAPI = require("../js/api.js");
const setupSSE = require("../js/sse.js");

let container = document.getElementById("container");
let app = Elm.Main.embed(container);

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

// Api
startAPI()
    .then(() => {
        setupSSE(app);
        app.ports.apiStarted.send(null);
    })
    .catch(error => {
        console.error("The API server could not be started");
    });
