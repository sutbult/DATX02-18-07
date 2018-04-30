
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
            api.kill("SIGINT");
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

module.exports = startAPI;
