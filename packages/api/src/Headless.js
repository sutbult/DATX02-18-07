const HeadlessChrome = require("simple-headless-chrome")
var path = require("path")

var directory;
var dbAddress;
var browser;

async function init() {
    directory = path.resolve("./");
    dbAddress = "null";
    browser = new HeadlessChrome({
        headless: false // If you turn this off, you can actually see the browser navigate with your instructions
        // see above if using remote interface
    });
}
async function createDB(name, type, permission) {
    try {
        await browser.init()
        const mainTab = await browser.newTab({
            privateTab: false
        })

        await mainTab.goTo('file:///' + directory + "/src/DB.html")
        await mainTab.type("#nameInput", name)
        await mainTab.type("#typeInput", type)

        if (permission == "public") {
          await mainTab.type("#permissionInput", 'true')
        }
        else {
          await mainTab.type("#permissionInput", permission)
        }

        await mainTab.click("#createBtn")
        await mainTab.onConsole(listener)
        await mainTab.wait(2000)
        //await mainTab.close()
        return dbAddress
    } catch (err) {
        console.log("ERROR!", err)
    }

}

async function close(){
  await browser.close()
}
function listener(word) {
    var string = JSON.stringify(word, null, 2)
    if (string.includes("orbit")) {
       dbAddress = word[0].value
    }
}

module.exports = {
    init,
    createDB,
    close
};
