
const localStore = require("../src/localStore.js");

afterEach(() => {
    localStore.clear();
});

describe("local store", () => {
    it("can retrieve a value that has been set", () => {
        localStore.set("test", "value");
        expect(localStore.get("test")).toBe("value");
    });
    it("returns null as default value", () => {
        expect(localStore.get("test")).toBe(null);
    });
})
