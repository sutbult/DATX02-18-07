"use strict"
const Elm = require("./elm.js");
const Api = require("../api/index.js");

let container = document.getElementById("container");
let app = Elm.Main.embed(container);
