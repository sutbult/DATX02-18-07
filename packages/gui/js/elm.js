
const child_process = require('child_process');

const NPM_CMD = /^win/.test(process.platform)
    ? "npm.cmd"
    : "npm"
    ;

function compileElm() {
    return new Promise((resolve, reject) => {
        const proc = child_process.spawn(NPM_CMD, ["run", "elm:build"], {
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
