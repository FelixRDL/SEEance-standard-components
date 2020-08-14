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
    reloadOnly: false,
    onlyLoad: ['files', 'blame', 'commits']
  })
  await cp.init()
  const datasources = await Promise.all(['blame', 'commits', 'files'].map((n) => cp.getDatasourceByName(n)))
  return core.analyze(process.argv[2], process.argv[3], datasources, [{
    package: preprocessorPkg,
    module: preprocessor,
    config: {
      extensions: ['jpg', 'svg', 'png', 'mp4', 'wav'],
      contains: ['package-lock']
    }
  }], {
    config: {},
    module: async (i, c, v) => {
      return Promise.resolve(i)
    },
    package: {
      name: 'x',
      seeance: {}
    }
  })
}
