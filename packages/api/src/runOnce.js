
function runOnce(fn) {
    var performed = false;
    var resultQueue = [];

    function runFunction() {
        fn()
            .then(() => {
                for(var i in resultQueue) {
                    resultQueue[i].resolve();
                }
                performed = true;
            })
            .catch((error) => {
                for(var i in resultQueue) {
                    resultQueue[i].reject(error);
                }
                resultQueue = [];
            });
    }
    function newResultPromise() {
        return new Promise((resolve, reject) => {
            resultQueue.push({
                resolve,
                reject,
            });
            if(resultQueue.length === 1) {
                runFunction();
            }
        });
    }
    function run() {
        if(!performed) {
            return newResultPromise();
        }
        else {
            return Promise.resolve();
        }
    }
    function reset() {
        performed = false;
        resultQueue = [];
    }
    run.reset = reset;
    return run;
}
module.exports = runOnce;
