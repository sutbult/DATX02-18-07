"use strict"
const Elm = require("../build/elm.js");
const child_process = require("child_process");
const electron = require("electron");
const startAPI = require("../js/api.js");
const setupSSE = require("../js/sse.js");
const store = require("../js/store.js");

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

// Filters
async function loadFilters() {
    const filters = await store.get("filters");
    const filterOrder = await store.get("filterOrder");

    if(filters && filterOrder) {
        app.ports.subFilters.send([
            "init",
            filters,
            filterOrder,
        ]);
    }
}
app.ports.saveFilters.subscribe(filterData => {
    app.ports.subFilters.send(filterData);

    store.set("filters", filterData[1]).then(() => {
        store.set("filterOrder", filterData[2]);
    });
});

// Api
startAPI()
    .then(() => {
        setupSSE(app);
        app.ports.apiStarted.send(null);
        return loadFilters();
    })
    .catch(error => {
        console.error("The API server could not be started");
    });
