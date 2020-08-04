
const rimraf = require('rimraf')
const script = require('./index')
const fs = require('fs')
const package = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const path = './.tmp'
const logger = require('seeance-analysis-core').log
const analyze = require('seeance-analysis-core').analyze

rimraf(path, () => {
  analyze(process.argv[2], process.argv[3], [
    {
      manifest: package.seeance,
      package: package,
      module: script
    }
  ], [], {
    package: {
      name: "TEST",
      seeance: {}
    },
    module: async function(input, config, vis) {
      console.log(input)
      return Promise.resolve()
    }
  })
})
