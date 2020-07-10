const git = require('simple-git').gitP
const rimraf = require('rimraf').sync
const script = require('./index')
const path = `${__dirname}/.tmp`

rimraf(path)
test()

async function test() {
  await git().clone(process.argv[2], path)
  const result = await script(path)
  console.log("DATASOURCE TEST:")
  console.log(result)
  rimraf(path)
}