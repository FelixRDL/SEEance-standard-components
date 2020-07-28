module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const numFiles = input.commits.map((c) => c.filesChanged.length)
    const additions = input.commits.map((c) => c.additions)
    const deletions = input.commits.map((c) => c.deletions)
    numFiles.sort((a, b) => a - b)
    additions.sort((a, b) => a - b)
    deletions.sort((a, b) => a - b)
    const xs = numFiles.map((n, i) => i)

    resolve(visualisation.plot([
      {
        x: xs,
        y: numFiles,
        type: 'bar',
        name: 'Changed Files',
        line: {
          color: 'blue'
        }
      },
      {
        x: xs,
        y: additions,
        type: 'bar',
        name: 'Additions',
        line: {
          color: 'green'
        }
      },
      {
        x: xs,
        y: deletions,
        type: 'bar',
        name: 'Deletions',
        line: {
          color: 'red'
        }
      }
    ], {
      title: 'Typical change size by commit',
      yaxis: {
        title: {
          text: 'Commit size'
        }
      }
    }))
  })
}
