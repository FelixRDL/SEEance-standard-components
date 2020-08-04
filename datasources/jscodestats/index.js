const esc = require('escomplex')
const glob = require('glob')
const fs = require('fs')

module.exports = async function (localPath, token = undefined) {
  /**
   * Solution taken by github User michaelficarra, https://github.com/jquery/esprima/issues/1151
   * @param text
   * @returns {*}
   */
  function trimShebang (text) {
    return text.replace(/^#!([^\r\n]+)/, function (match, captured) { return '//' + captured })
  }

  return new Promise((resolve, reject) => {
    glob(localPath + '/**/*.js', {}, async (err, files) => {
      const code = await Promise.all((files.map(file => fs.promises.readFile(file, 'utf-8'))))
      const fileMap = files.map((file, i) => {
        return {
          path: file,
          code: trimShebang(code[i])
        }
      })
      try {
        console.log(fileMap.map(f => f.path))
        const result = esc.analyse(fileMap, {

        })
        resolve(result.reports)
      } catch (e) {
        reject(e)
      }
    })
  })
}
