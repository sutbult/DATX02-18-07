let compiler
let optimize = 1
let compiledContract

window.onload = function () {
  document.getElementById('versions').onchange = loadSolcVersion

  if (!BrowserSolc) {
    console.log('You have to load browser-solc.js in the page. We recommend using a <script> tag.')
    throw new Error()
  }

  status('Loading Compiler Versions...')

  BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
    populateVersions(soljsonSources)
    setVersion(soljsonReleases['0.4.18'])
    loadSolcVersion()
  })

  addCompileEvent()
  addDeployEvent()
}

function loadSolcVersion() {
  status(`Loading Solc: ${getVersion()}`)
  console.log(getVersion())
  BrowserSolc.loadVersion('soljson-v0.4.18+commit.9cf6e910.js', function (c) {
    status('Solc loaded.')
    compiler = c
  })
}

function getVersion() {
  return document.getElementById('versions').value
}

function setVersion(version) {
  document.getElementById('versions').value = version
}

function populateVersions(versions) {
  sel = document.getElementById('versions')
  sel.innerHTML = ''

  for (let i = 0; i < versions.length; i++) {
    let opt = document.createElement('option')
    opt.appendChild(document.createTextNode(versions[i]))
    opt.value = versions[i]
    sel.appendChild(opt)
  }
}

function status(txt) {
  document.getElementById('status').innerHTML = txt
}

function addCompileEvent() {
const compileBtn = document.getElementById('contract-compile')
compileBtn.addEventListener('click', solcCompile)
}

function solcCompile() {
    if (!compiler) return alert('Please select a compiler version.') 

    setCompileButtonState(true)
    status("Compiling contract...")
    compiledContract = compiler.compile(getSourceCode(), optimize)

    if (compiledContract) setCompileButtonState(false)

    console.log('Compiled Contract :: ==>', compiledContract)
    status("Compile Complete.")
}

function getSourceCode() {
    return document.getElementById("source").value
}

function setCompileButtonState(state) {
    document.getElementById("contract-compile").disabled = state
}

