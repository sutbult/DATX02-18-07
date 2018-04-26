
const fs = require("fs");
const os = require("os");
const path = require("path");

// Has to be the same file as in the source file
const STORE_PATH_DIR = path.join(
    os.homedir(),
    ".DATX02-18-07"
);
const STORE_PATH = path.join(
    STORE_PATH_DIR,
    "api_store.json"
);
const STORE_PATH_TEMP = path.join(
    STORE_PATH_DIR,
    "api_store.json.temp"
);
const diskStore = require("../src/diskStore.js");

function loadTestStore() {
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
function saveTestStore(storeString) {
    return new Promise((resolve, reject) => {
        fs.writeFile(STORE_PATH, storeString, "utf8", error => {
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
function removeDiskStore() {
    return new Promise((resolve, reject) => {
        fs.unlink(STORE_PATH, error => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
function rename(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, error => {
            if(error && error.code !== "ENOENT") {
                reject(error);
            }
            else {
                resolve();
            }
        })
    });
}

function run(expected, fn) {
    async function runTest() {
        return await fn();
    }
    expect.assertions(1);
    return expect(runTest()).resolves.toBe(expected);
}

beforeAll(() => {
    async function tasks() {
        await ensureFolder();
        await rename(STORE_PATH, STORE_PATH_TEMP);
    }
    return tasks();
});
afterEach(() => {
    diskStore.clearCache();
    return removeDiskStore();
});
afterAll(() => {
    return rename(STORE_PATH_TEMP, STORE_PATH);
});
describe("disk store", () => {
    it("can read a value from the disk storage", () => {
        return run("valueGet", async () => {
            await saveTestStore('{"testGet": "valueGet"}');
            return await diskStore.get("testGet");
        });
    });
    it("can write a value to the disk storage", () => {
        return run('{"testSet":"valueSet"}', async () => {
            await diskStore.set("testSet", "valueSet");
            return await loadTestStore();
        });
    });
    it("can get a value that has been set without cache", () => {
        return run('valueGetSet', async () => {
            await diskStore.set("testGetSet", "valueGetSet");
            diskStore.clearCache();
            return await diskStore.get("testGetSet");
        });
    });
    it("can get a value that has been set with cache", () => {
        return run('valueGetSet', async () => {
            await diskStore.set("testGetSet", "valueGetSet");
            return await diskStore.get("testGetSet");
        });
    });
})
