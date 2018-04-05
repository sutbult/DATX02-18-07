const HeadlessChrome = require("simple-headless-chrome")
var path = require("path")
var directory = path.resolve("./")
var dbAddress = "null"
const browser = new HeadlessChrome({
    headless: true // If you turn this off, you can actually see the browser navigate with your instructions
    // see above if using remote interface
})

async function createDB(name, type, permission) {
    try {
        await browser.init()
        const mainTab = await browser.newTab({
            privateTab: false
        })

        await mainTab.goTo('file:///' + directory + "/src/DB.html")
        await mainTab.type("#nameInput", name)
        await mainTab.type("#typeInput", type)

        if (permission == undefined || null) {
          await mainTab.type("#permissionInput", 'false')
        }
        else {
          await mainTab.type("#permissionInput", 'true')
        }
        
        await mainTab.click("#createBtn")
        await mainTab.onConsole(listener)
        await mainTab.wait(2000)
      //  await browser.close()
        return dbAddress
    } catch (err) {
        console.log("ERROR!", err)
    }

}
function listener(word) {
    var string = JSON.stringify(word, null, 2)
    if (string.includes("orbit")) {
       dbAddress = word[0].value
    }
}

module.exports = {
  createDB
}
