const api = require("../index.js");

describe("Index", () => {
    describe("get bids", () => {
        it("can get bids", () => {
            async function test() {
                const bids = await api.getBids();
                console.log("Dessa bud finns: ");
                console.log(bids);
                await api.stop();
                return true;
            }
            expect.assertions(1);
            return expect(test()).resolves.toBe(true);
        });
    });
});
