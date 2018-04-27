
var store = {};

function fkey(key) {
    if(key) {
        return key.toString();
    }
    else {
        return "null";
    }
}
function get(key) {
    return store[fkey(key)] || null;
}
function set(key, value) {
    store[fkey(key)] = value;
}
// Only for testing purposes
function clear() {
    store = {};
}

module.exports = {
    get,
    set,
    clear,
};
