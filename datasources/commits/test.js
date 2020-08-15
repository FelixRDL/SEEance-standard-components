const git = require('simple-git').gitP
const rimraf = require('rimraf').sync
const script = require('./index')
const path = `${__dirname}/.tmp`
const fs = require('fs')

rimraf(path)
test()

async function test () {
  await git().clone(process.argv[2], path)
  const result = await script(path)
  console.log('DATASOURCE TEST:')
  console.log(result)
  fs.writeFileSync('./reslt.json', JSON.stringify(result, undefined, 2))
  // rimraf(path)
}
