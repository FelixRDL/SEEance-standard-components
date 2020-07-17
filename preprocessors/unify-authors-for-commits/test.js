const fs = require('fs')
const core = require('seeance-analysis-core')
const preprocessor = require('./index')
const preprocessorPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const ComponentProvider = core.ComponentProvider

runTest().then(() => {
  process.exit(0)
})

async function runTest () {
  const cp = await ComponentProvider({
    customRepositories: [],
    reloadOnly: true
  })
  await cp.init()
  const datasources = await Promise.all(['commits'].map((n) => cp.getDatasourceByName(n)))
  return core.analyze(process.argv[2], process.argv[3], datasources, [{
    package: preprocessorPkg,
    module: preprocessor,
    config: {
      mappings: 'unknown:Johannes Dengler;Unknown:Johannes Dengler;PWinderl:Paul Winderl;FelixRDL:Felix Riedl'
    }
  }], {
    config: {},
    module: async (i, c, v) => {
      console.log('TEST: PRINT RESULT')
      console.log(i)
      return Promise.resolve('success')
    },
    package: {
      name: 'x'
    }
  })
}
