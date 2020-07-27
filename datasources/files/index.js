const simpleGit = require('simple-git').gitP
const fs = require('fs')

module.exports = async function (localPath, token = undefined) {
  return new Promise(async (resolve, reject) => {
    const git = simpleGit(localPath)
    const files = (await git.raw(['ls-files'])).split('\n')
    let s = (await Promise.all(files.map(file => fs.promises.stat(localPath + '/' + file)))).map((s, i) => {
      return {
        file: files[i],
        stats: s
      }
    })
    s = s.filter((stat, i) => stat.stats.isFile())
    const lines = (await Promise.all(s.map(item => {
      return fs.promises.readFile(localPath + '/' + item.file, 'utf-8')
    }))).map(content => content.split('\n').length)

    const result = s.map((item, i) => {
      return {
        file: item.file,
        stats: item.stats,
        lines: lines[i]
      }
    })
    resolve(result)
  })
}
