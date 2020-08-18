const fs = require('fs')
const http = require('http')
const core = require('seeance-analysis-core')
const analysis = require('./index')
const analysisPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const ComponentProvider = core.ComponentProvider

runTest()

async function runTest () {
  const sourcesNames = analysisPkg.seeance.depends_on
  const cp = await ComponentProvider({
    customRepositories: [],
    onlyLoad: sourcesNames
  })
  await cp.init()
  const datasources = await Promise.all(sourcesNames.map((n) => cp.getDatasourceByName(n)))
  const result = await core.analyze(process.argv[2], process.argv[3], datasources, [], {
    package: analysisPkg,
    module: analysis,
    config: {
      normalize: true
    }
  })
  // Solution by stackoverflow user JLeXanDR
  // (https://stackoverflow.com/questions/35995273/how-to-run-html-file-using-node-js)
  if (process.argv.includes('--serve')) {
    console.log('ANALYSIS TEST: Serving analysis output on http://localhost:8080')
    http.createServer(function (request, response) {
      response.writeHeader(200, { 'Content-Type': 'text/html' })
      response.write(result)
      response.end()
    }).listen(8080)
  } else {
    process.exit(0)
  }
}
