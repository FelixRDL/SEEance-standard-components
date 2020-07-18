const esc = require('escomplex')
const glob = require('glob')
const fs = require('fs')

module.exports = async function (localPath, token = undefined) {

  /**
   * Solution taken by github User michaelficarra, https://github.com/jquery/esprima/issues/1151
   * @param text
   * @returns {*}
   */
  function trimShebang(text) {
    return text.replace(/^#!([^\r\n]+)/, function(match, captured) { return "//" + captured; });
  }

  return new Promise((resolve, reject) => {
    glob(localPath + '/**/*.js', {}, (err, files)=>{
      const fileMap = files.map(f => {
        return {
          path: f,
          code: trimShebang(fs.readFileSync(f, 'utf-8'))
        }
      })

      const result = esc.analyse(fileMap, {})
      result.reports.map((d) => console.log(d.functions))

      resolve(result.reports)
    })
  })
}
