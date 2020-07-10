module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    let numFiles = input.commits.map((c) => c.filesChanged.length)
    let additions = input.commits.map((c) => c.additions)
    let deletions = input.commits.map((c) => c.deletions)

    function normalize(numArray) {
      const max = numArray.reduce((a,b) => a<b?b:a, 0)
      return numArray.map(v => v/max)
    }

    numFiles.sort((a, b) => a-b)
    additions.sort((a, b) => a-b)
    deletions.sort((a, b) => a-b)
    let xs = numFiles.map((n, i) => i)


    if(config['normalize'] && config['normalize'] == true) {
      numFiles = normalize(numFiles)
      additions = normalize(additions)
      deletions = normalize(deletions)
    }

    resolve(visualisation.plot([
      {
        x: xs,
        y: numFiles,
        type: 'bar',
        name: 'Changed Files per Commit'
      },
      {
        x: xs,
        y: additions,
        type: 'bar',
        name: 'Additions per Commit'
      },
      {
        x: xs,
        y: deletions,
        type: 'bar',
        name: 'Deletions per Commit'
      }
    ], {
      title: "Typical change size by commit"
    }));
  })
}
