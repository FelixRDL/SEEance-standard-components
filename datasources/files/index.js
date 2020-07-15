const simpleGit = require('simple-git').gitP;
const fs = require('fs')

module.exports = async function (localPath, token = undefined) {
  const git = simpleGit(localPath);
  let r = (await git.raw(['ls-files'])).split("\n")
  const promises = r.map(async (f) => {
    return {
      file: f,
      stats: fs.statSync(localPath+'/'+f)
    };
  })
  const sizes = await Promise.all(promises)

  return new Promise((resolve, reject) => {
    /**
         * TODO: Implement your data acquisition logic here.
         *
         * You can use nodegit (pre-installed), as well as any other node library for this purpose.
         * Make sure to install them properly via npm i before referencing them.
         *
         * Call 'resolve' with the results of the acquisition.
         * */

    resolve(sizes)
  })
}
