// Command Set by TextArcana https://gist.github.com/textarcana/1306223
const diffTemplateCommand = `
     cd $LOCALPATH; \\
     git log \\
    --numstat \\
    --format='%H' \\
    $@ | \\
    perl -lawne '
        if (defined $F[1]) {
            print qq#{"insertions": "$F[0]", "deletions": "$F[1]", "path": "$F[2]"},#
        } elsif (defined $F[0]) {
            print qq#],\\n"$F[0]": [#
        };
        END{print qq#],#}' | \\
    tail -n +2 | \\
    perl -wpe 'BEGIN{print "{"}; END{print "}"}' | \\
    tr '\\n' ' ' | \\
    perl -wpe 's#(]|}),\\s*(]|})#$1$2#g' | \\
    perl -wpe 's#,\\s*?}$#}#'
`
const diffLogCommand = `cd $LOCALPATH; \\
git log \\
    --pretty=format:'{%n  "commit": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},' \\
    $@ | \\
    perl -pe 'BEGIN{print "["}; END{print "]\\n"}' | \\
    perl -pe 's/},]/}]/'
`

function getDiffs (localPath) {
  return new Promise((resolve, reject) => {
    const command = diffTemplateCommand.replace('$LOCALPATH', localPath)
    require('child_process').exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
}

function getLog (localPath) {
  return new Promise((resolve, reject) => {
    const command = diffLogCommand.replace('$LOCALPATH', localPath)
    require('child_process').exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
}

module.exports = async function (localPath, token = undefined) {
  return new Promise((resolve, reject) => {
    getLog(localPath).then((logs) => {
      getDiffs(localPath).then((diffs) => {
        console.log(diffs)
        let result = logs.map((log) => {
          log.diff = diffs[log.commit]
          return log
        })
        result = result.map(item => {
          const fileDiffs = item.diff.map((diff) => {
            return {
              file: diff.path,
              insertions: diff.insertions,
              deletions: diff.deletions
            }
          })
          return {
            hash: item.commit,
            date: item.date,
            message: item.message,
            author_name: item.author.split(' <')[0],
            author_email: (item.author.split(' <')[1]).split('>')[0],
            diff: {
              files: fileDiffs,
              insertions: fileDiffs.reduce((a, d) => { return a + d.insertions }, 0),
              deletions: fileDiffs.reduce((a, d) => { return a + d.deletions }, 0),
              changed: fileDiffs.length
            },
            insertions: fileDiffs.reduce((a, d) => { return a + d.insertions }, 0),
            deletions: fileDiffs.reduce((a, d) => { return a + d.deletions }, 0),
            filesChanged: fileDiffs
          }
        })
        resolve(result)
      })
    })
  })
}
