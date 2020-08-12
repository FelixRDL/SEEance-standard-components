const exec = require('child_process').exec
var parse = require('parse-diff')

const diffLogCommand = `cd $LOCALPATH; \\
git log \\
    --pretty=format:'{%n  "hash": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},' \\
    $@ | \\
    perl -pe 'BEGIN{print "["}; END{print "]\\n"}' | \\
    perl -pe 's/},]/}]/'
`

const diffStatCommand = `cd $LOCALPATH;  \\
git diff $STARTHASH $ENDHASH`
//  | diffstat -C -f0 -m -k

async function getLog (path) {
  return new Promise((resolve, reject) => {
    const cmd = diffLogCommand.replace(/\$LOCALPATH/gi, path)
    exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
}

function parseGitstat (gitStatStr) {
  const parsed = summarizeDiff(parse(gitStatStr))
  return parsed
}

function summarizeDiff (diff) {
  const summary = diff.map(file => {
    const fileOps = {
      file: file.to,
      oldFile: file.from,
      insertions: 0,
      deletions: 0,
      modifications: 0
    }
    file.chunks.map((chunk) => {
      if (chunk) {
        const insertions = chunk.changes.filter(change => change.type === 'add').length
        const deletions = chunk.changes.filter(change => change.type === 'del').length
        if (insertions === deletions) {
          fileOps.modifications += insertions
        } else if (insertions > deletions) {
          fileOps.modifications += deletions
          fileOps.insertions += insertions - deletions
        } else {
          fileOps.modifications += insertions
          fileOps.deletions += deletions - insertions
        }
      }
    })
    return fileOps
  })
  return summary
}

async function getDiffStat (path, commitA, commitB) {
  return new Promise((resolve, reject) => {
    const cmd = diffStatCommand.replace('$LOCALPATH', path)
      .replace('$STARTHASH', commitA)
      .replace('$ENDHASH', commitB)
    exec(cmd, { maxBuffer: 1024 * 5096 }, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr)
      } else {
        resolve(parseGitstat(stdout))
      }
    })
  })
}

async function getDiffs (path) {
  const log = (await getLog(path)).reverse()
  const promises = log.map((commit, index) => {
    return new Promise((resolve, reject) => {
      const commitA = index === 0 ? '4b825dc642cb6eb9a060e54bf8d69288fbee4904' : log[index - 1].hash
      const commitB = commit.hash
      getDiffStat(path, commitA, commitB).then(diffs => {
        resolve({
          hash: commit.hash,
          date: new Date(commit.date).toISOString(),
          message: commit.message,
          author_name: commit.author.split(' <')[0],
          author_email: (commit.author.split(' <')[1]).split('>')[0],
          diff: {
            files: diffs,
            insertions: diffs.reduce((a, d) => { return a + d.insertions }, 0),
            modifications: diffs.reduce((a, d) => { return a + d.modifications }, 0),
            deletions: diffs.reduce((a, d) => { return a + d.deletions }, 0),
            changed: diffs.length
          },
          insertions: diffs.reduce((a, d) => { return a + d.insertions }, 0),
          modifications: diffs.reduce((a, d) => { return a + d.modifications }, 0),
          deletions: diffs.reduce((a, d) => { return a + d.deletions }, 0),
          filesChanged: diffs
        })
      })
    })
  })
  return await Promise.all(promises)
}

module.exports = async function (localPath, token = undefined) {
  return getDiffs(localPath)
}
