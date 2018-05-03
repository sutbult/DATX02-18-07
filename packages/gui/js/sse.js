
function setupSSE(app) {
    function onSSEmessage(event) {
        var msg = JSON.parse(event.data);
        switch(msg.cmd) {
            case "ack":
                app.ports.getSSEId.send(msg.clientID);
                break;

            case "acceptBidResponse":
                if(msg.status === "ok") {
                    app.ports.acceptBidSuccess.send(null);
                }
                else {
                    app.ports.acceptBidFailure.send(msg.error);
                }
                break;

            case "updateBids":
                app.ports.updateBids.send(null);
                break;
        }
    }
    function init() {
        var es = new EventSource("http://localhost:51337/sse");
        es.onmessage = onSSEmessage;
    }
    init();
}

module.exports = setupSSE;
