const HeadlessChrome = require("simple-headless-chrome")
var path = require("path")

var directory;
var browser;
var browsers = []

async function init() {
    directory = path.resolve("./");
}
async function createDB(name, type, permission) {
    try {
        browser = new HeadlessChrome({
          headless: true // If you turn this off, you can actually see the browser navigate with your instructions
          // see above if using remote interface
        });
        await browser.init()
        browsers.push(browser)
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
        await mainTab.wait(9000)
        const address = await mainTab.evaluate(function(selector) {
          const selectorHtml = document.querySelector(selector)
          return selectorHtml.value
        }, "#address");
        return address.result.value
    } catch (err) {
        console.log("ERROR!", err)
    }

}

async function close(){
    if(browser) {
      await browser.close();
    }
}

async function closeAll(){
  var promises = [];
  for (var i = browsers.length - 1; i >= 0 ; i --){
     promises.push(browsers[i].close());
     browsers.splice(i,1);
  }
  await Promise.all(promises)
}

module.exports = {
    init,
    createDB,
    close,
    closeAll
};
