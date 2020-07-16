module.exports = async function (input, config) {
    return new Promise((resolve, reject) => {
        let sortedCommits = input.commits.sort((a, b) => a.additions - b.additions + a.deletions - b.deletions ? 1 : -1)
        let outlierFactor = config && config.factor ? config.factor : 3
        // taken from user Foxcode, https://stackoverflow.com/questions/7343890/standard-deviation-javascript
        const n = sortedCommits.length;
        const mean = sortedCommits.reduce((a,b) => a+b.additions+b.deletions, 0)/n;
        const sd = Math.sqrt(sortedCommits.map(x => Math.pow(x.additions+x.deletions-mean,2)).reduce((a,b) => a+b)/n);
        sortedCommits = sortedCommits.filter(c => Math.abs((c.additions + c.deletions)-mean) <= sd*outlierFactor)
        input.commits = sortedCommits
        resolve(input)
    })
}
