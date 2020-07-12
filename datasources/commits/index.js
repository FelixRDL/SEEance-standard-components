const simpleGit = require('simple-git').gitP;
const diffParse = require('parse-diff')

module.exports = async function (localPath, token = undefined) {
    return new Promise(async (resolve, reject) => {
        const git = simpleGit(localPath)
        let commits = (await git.log()).all
        const hashes = commits.map(c => c.hash)
        let promises = []

        commits.sort((a, b) =>
            new Date(a.date) <= new Date(b.date) ? -1 : 1
        )

        const firstCommit = commits[0]
        promises.push(new Promise(async function (resolve, reject) {
            firstCommit.diffs = diffParse(await git.diff([firstCommit.hash], ['HEAD']))
            firstCommit.additions = firstCommit.diffs.reduce((a, diff) => a + diff.additions, 0)
            firstCommit.deletions = firstCommit.diffs.reduce((a, diff) => a + diff.deletions, 0)
            firstCommit.filesChanged = firstCommit.diffs.map(d => d.to)
            resolve(firstCommit)
        }))


        for (let i = 1; i < hashes.length; i++) {
            let c = commits[i]
            let p = commits[i - 1]
            promises.push(new Promise(async function (resolve, reject) {
                const hash = c.hash
                const commit = c
                try {
                    let diffs = await git.diff([p.hash, hash])
                    try {
                        commit.diffs = diffParse(diffs)
                        commit.additions = commit.diffs.reduce((a, diff) => a + diff.additions, 0)
                        commit.deletions = commit.diffs.reduce((a, diff) => a + diff.deletions, 0)
                        commit.filesChanged = commit.diffs.map(d => d.to)
                    } catch(e) {
                        commit.diffs = undefined
                        commit.additions = 0
                        commit.deletions = 0
                        commit.filesChanged = 0
                    }
                    resolve(commit)
                } catch(e) {
                    console.error(e)
                    reject(e)
                }
            }))
        }
        commits = await Promise.all(promises)
        commits.push()
        resolve(commits)
    })
}
