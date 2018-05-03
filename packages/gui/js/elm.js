
const child_process = require('child_process');

function compileElm() {
    return new Promise((resolve, reject) => {
        const proc = child_process.spawn("npm", ["run", "elm:build"], {
            cwd: ".",
        });
        function kill() {
            proc.kill();
        }
        proc.stdout.on("data", data => {
            console.log("Elm: %s", data.toString("utf-8"));
        });
        proc.stderr.on("data", data => {
            console.error("Elm error: %s", data.toString("utf-8"));
        });
        proc.on("close", code => {
            if(code === 0) {
                resolve();
            }
            else {
                reject(code);
            }
        });
        process.on("exit", kill);
    });
}

module.exports = compileElm;
