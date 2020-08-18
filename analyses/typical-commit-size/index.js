module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const numFiles = input.commits.map((c) => c.filesChanged.length)
    const additions = input.commits.map((c) => c.additions)
    const deletions = input.commits.map((c) => c.deletions)
    const modifications = input.commits.map((c) => c.modifications)
    numFiles.sort((a, b) => a - b)
    additions.sort((a, b) => a - b)
    deletions.sort((a, b) => a - b)
    modifications.sort((a, b) => a - b)
    const xs = numFiles.map((n, i) => i)

    resolve(visualisation.plot([
      {
        x: xs,
        y: numFiles,
        type: 'bar',
        name: 'Files Changed',
        line: {
          color: 'blue'
        }
      },
      {
        x: xs,
        y: additions,
        type: 'bar',
        name: 'Insertions',
        line: {
          color: 'green'
        }
      },
      {
        x: xs,
        y: modifications,
        type: 'bar',
        name: 'Modifications',
        line: {
          color: 'orange'
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
      title: 'Commit Size<br><sub>Number of lines and files per commit, sorted by size</sub>',
      xaxis: {
        title: {
          text: 'Index'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Lines/Number of Files'
        }
      }
    }))
  })
}
