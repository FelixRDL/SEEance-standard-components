const simpleGit = require('simple-git').gitP;
const fs = require('fs')

module.exports = async function (localPath, token = undefined) {
  return new Promise(async(resolve, reject) => {
    const git = simpleGit(localPath);
    let r = (await git.raw(['ls-files'])).split("\n")
    const promises = r.map((f) => {
      return Promise.resolve({
        file: f,
        stats: fs.statSync(localPath+'/'+f)
      })
    })
    const sizes = await Promise.all(promises)
    resolve(sizes)
  })
}
