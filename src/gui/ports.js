"use strict"
const Elm = require("./elm.js");
const Api = require("../api/index.js");

let container = document.getElementById("container");
let app = Elm.Main.embed(container);

// Exempel på portar
app.ports.getBids.subscribe(function(arg) {
    Api.getBids((error, bids) => {
        app.ports.getBidsCallback.send(bids);
    });
});
