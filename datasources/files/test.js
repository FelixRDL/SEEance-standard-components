const git = require('simple-git')
const rimraf = require('rimraf')
const script = require('./index')
const path = './.tmp'
const logger = require('seeance-analysis-core').log

rimraf(path, () => {
  git().clone(process.argv[2], path).then(async () => {
    const result = await script(path)
    console.log('DATASOURCE TEST:', result)
    rimraf(path, () => {})
  })
})
