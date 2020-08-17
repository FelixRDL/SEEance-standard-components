const spawn = require('child_process').spawn
var parse = require('parse-diff')

async function getLog (path) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    try {
      const childProcess = spawn('git', [
        'log',
        '--pretty=format:{%n  "hash": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},'
      ], {
        cwd: path
      })
      childProcess.stdout.on('data', function (data) {
        buffer += data.toString('utf8')
      })
      childProcess.on('close', function (data) {
        const fixedBuffer = ('[' + buffer + ']').replace('},]', '}]')
        resolve(JSON.parse(fixedBuffer))
      })
      childProcess.stderr.on('data', function (data) {
        reject(data)
      })
    } catch (e) {
      reject(e)
    }
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
    let buffer = ''
    try {
      const childProcess = spawn('git', [
        'diff',
        commitA + '..' + commitB
      ], {
        cwd: path
      })
      childProcess.stdout.on('data', function (data) {
        buffer += data.toString('utf8')
      })
      childProcess.on('close', function (data) {
        resolve(parseGitstat(buffer))
      })
      childProcess.stderr.on('data', function (data) {
        reject(data)
      })
    } catch (e) {
      reject(e)
    }
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
            additions: diffs.reduce((a, d) => { return a + d.insertions }, 0),
            modifications: diffs.reduce((a, d) => { return a + d.modifications }, 0),
            deletions: diffs.reduce((a, d) => { return a + d.deletions }, 0),
            changed: diffs.length
          },
          additions: diffs.reduce((a, d) => { return a + d.insertions }, 0),
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
