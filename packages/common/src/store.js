
const fs = require("fs");
const os = require("os");
const path = require("path");

const STORE_PATH_DIR = path.join(
    os.homedir(),
    ".DATX02-18-07"
);
function fullPath(storeName) {
    return path.join(
        STORE_PATH_DIR,
        storeName + "_store.json"
    );
}

// IO

function loadStoreString(storeName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath(storeName), "utf8", (error, storeString) => {
            if(error) {
                reject(error);
            }
            else {
                resolve(storeString);
            }
        })
    });
}
function saveStoreString(storeName, storeString) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fullPath(storeName), storeString, "utf8", error => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        })
    });
}
function ensureFolder() {
    return new Promise((resolve, reject) => {
        fs.mkdir(STORE_PATH_DIR, error => {
            if(error && error.code !== "EEXIST") {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
async function loadStore(storeName) {
    const storeString = await loadStoreString(storeName);
    return JSON.parse(storeString);
}
async function saveStore(storeName, store) {
    await saveStoreString(storeName, JSON.stringify(store));
}
async function getStoreRaw(storeName) {
    try {
        return await loadStore(storeName);
    }
    catch(error) {
        if(error.code === "ENOENT") {
            await ensureFolder();
            saveStore(storeName, {});
            return getStore(storeName);
        }
        else {
            throw error;
        }
    }
}

// Cache

var storeCache = {};

async function getStore(storeName) {
    if(!storeCache[storeName]) {
        storeCache[storeName] = await getStoreRaw(storeName);
    }
    return storeCache[storeName];
}
// Only for testing purposes
function clearCache(storeName) {
    storeCache[storeName] = null;
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
async function get(storeName, key) {
    const store = await getStore(storeName);
    return store[fkey(key)] || null;
}
async function set(storeName, key, value) {
    const store = await getStore(storeName);
    store[fkey(key)] = value;
    await saveStore(storeName, store);
}

module.exports = {
    get,
    set,
    clearCache,
};
