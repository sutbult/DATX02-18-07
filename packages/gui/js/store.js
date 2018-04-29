
const store = require("../../common/src/store.js");

async function get(key) {
    return await store.get("gui", key);
}
async function set(key, value) {
    await store.set("gui", key, value);
}

module.exports = {
    get,
    set,
};
