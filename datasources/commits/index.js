const simpleGit = require('simple-git').gitP;
const diffParse = require('parse-diff')

module.exports = async function (localPath, token = undefined) {
    return new Promise(async (resolve, reject) => {
        const git = simpleGit(localPath)
        let commits = (await git.log()).all
        const hashes = commits.map(c => c.hash)
        let promises = []
        
        const firstCommit = commits[0]
        promises.push(new Promise(async function(resolve, reject) {
         firstCommit.diffs = diffParse(await git.diff([firstCommit.hash], ['HEAD']))   
         firstCommit.additions = firstCommit.diffs.reduce((a, diff) => a + diff.additions, 0)
         firstCommit.deletions = firstCommit.diffs.reduce((a, diff) => a + diff.deletions, 0)
         firstCommit.filesChanged = firstCommit.diffs.map(d => d.to)
         resolve(firstCommit)
        }))
        
        
        for (let i = 1; i < hashes.length; i++) {
            let c = commits[i]
            let p = commits[i-1]
            promises.push(new Promise(async function (resolve, reject) {
                const hash = c.hash
                const commit = c
                commit.diffs = diffParse(await git.diff([p.hash, hash]))
                commit.additions = commit.diffs.reduce((a, diff) => a + diff.additions, 0)
                commit.deletions = commit.diffs.reduce((a, diff) => a + diff.deletions, 0)
                commit.filesChanged = commit.diffs.map(d => d.to)
                resolve(commit)
            }))
        }
        commits = await Promise.all(promises)
        commits.push()
        resolve(commits)
    })
}
