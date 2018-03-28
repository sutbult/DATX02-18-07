const HeadlessChrome = require('simple-headless-chrome')
var path = require("path")
var directory = path.resolve("./")
var str
const browser = new HeadlessChrome({
    headless: false // If you turn this off, you can actually see the browser navigate with your instructions
    // see above if using remote interface
})

async function navigateWebsite() {
    try {
        await browser.init()

        const mainTab = await browser.newTab({
            privateTab: false
        })

        await mainTab.goTo('file:///' + directory + '/src/db.html')
        await mainTab.onConsole(listener)
        await mainTab.wait(10000)
        await browser.close()
    } catch (err) {
        console.log('ERROR!', err)
    }

  //  await browser.close()
}

navigateWebsite()

function listener(word) {
    var string = JSON.stringify(word, null, 2)

    if (string.includes("orbit")) {
        str = string.substring(string.indexOf('/orbit'), string.indexOf('createdb'))
        str = str + 'createdb'
        console.log(str)
    }
}

function getDB(){
  return str
}

module.exports = {
  getDB
}
