const simpleGit = require('simple-git').gitP;
const fs = require('fs');

module.exports = async function (localPath, token = undefined) {
  return new Promise(async(resolve, reject) => {
    const git = simpleGit(localPath);
    let files = (await git.raw(['ls-files'])).split("\n")
    const s = await Promise.all(files.map(file => fs.promises.stat(localPath + '/' + file)))
    const result = files.map((file, i) => {
      return {
        file: file,
        stats: s[i]
      }
    })
    resolve(result)
  })
}
