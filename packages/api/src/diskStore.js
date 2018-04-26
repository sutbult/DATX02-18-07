
const fs = require("fs");
const os = require("os");
const path = require("path");

const STORE_PATH = path.join(
    os.homedir(),
    ".DATX02-18-07",
    "api_store.json"
);


// IO

function loadStoreString() {
    return new Promise((resolve, reject) => {
        fs.readFile(STORE_PATH, "utf8", (error, storeString) => {
            if(error) {
                reject(error);
            }
            else {
                resolve(storeString);
            }
        })
    });
}
function saveStoreString(storeString) {
    return new Promise((resolve, reject) => {
        fs.writeFile(STORE_PATH, storeString, "utf8", (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        })
    });
}
async function loadStore() {
    const storeString = await loadStoreString();
    return JSON.parse(storeString);
}
async function saveStore(store) {
    return await saveStoreString(JSON.stringify(store));
}
async function getStoreRaw() {
    try {
        return await loadStore();
    }
    catch(error) {
        if(error.code === "ENOENT") {
            saveStore({});
            return getStore();
        }
        else {
            throw error;
        }
    }
}

// Cache

var storeCache = null;

async function getStore() {
    if(!storeCache) {
        storeCache = await getStoreRaw();
    }
    return storeCache;
}
// Only for testing purposes
function clearCache() {
    storeCache = null;
}

// Root functions

function fkey(key) {
    if(key) {
        return key.toString();
    }
    else {
        return "null";
    }
}
async function get(key) {
    const store = await getStore();
    return store[fkey(key)] || null;
}
async function set(key, value) {
    const store = await getStore();
    store[fkey(key)] = value;
    await saveStore(store);
}

async function test() {
    await set("foo", "bar");
    await set("bar", 5);
    console.log(await get("foo"));
    console.log(await get("bar"));
}
test();

module.exports = {
    get,
    set,
};
