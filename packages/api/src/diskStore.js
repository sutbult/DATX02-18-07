
const store = require("../../common/src/store.js");

async function get(key) {
    return await store.get("api", key);
}
async function set(key, value) {
    return await store.set("api", key, value);
}
// Only for testing purposes
function clearCache() {
    store.clearCache("api");
}

module.exports = {
    get,
    set,
    clearCache,
};
