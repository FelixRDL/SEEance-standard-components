module.exports = async function (input, config, visualisation) {
  function sumReducer (acc, item) {
    return acc + parseInt(item)
  }

  function groupDiffsByCommiterReducer (acc, commit) {
    const files = commit.diff.files
    if (!acc[commit.author_name]) {
      acc[commit.author_name] = files
    } else {
      acc[commit.author_name] = acc[commit.author_name].concat(files)
    }
    return acc
  }

  return new Promise((resolve, reject) => {
    const diffsByAuthors = input.commits.reduce(groupDiffsByCommiterReducer, {})
    const traces = []
    Object.keys(diffsByAuthors).map(author => {
      const groupedDiffs = {}
      diffsByAuthors[author].map((diff) => {
        const file = diff.file
        if (!groupedDiffs[file]) {
          groupedDiffs[file] = [diff]
        } else {
          groupedDiffs[file].push(diff)
        }
      })

      if (groupedDiffs['/dev/null']) {
        delete groupedDiffs['/dev/null']
      }
      const insertionFiles = Object.keys(groupedDiffs).map((file) => {
        return {
          file: file,
          insertions: groupedDiffs[file].map(diff => diff.insertions).reduce(sumReducer, 0)
        }
      }).filter((entry) => entry.insertions > 0)
      const modifiedFiles = Object.keys(groupedDiffs).map((file) => {
        return {
          file: file,
          modifications: groupedDiffs[file].map(diff => diff.modifications).reduce(sumReducer, 0)
        }
      }).filter((entry) => entry.modifications > 0)
      const deletionFiles = Object.keys(groupedDiffs).map((file) => {
        return {
          file: file,
          deletions: groupedDiffs[file].map(diff => diff.deletions).reduce(sumReducer, 0)
        }
      }).filter((entry) => entry.deletions > 0)

      traces.push({
        x: insertionFiles.map(entry => entry.file),
        y: insertionFiles.map(entry => entry.insertions),
        type: 'bar',
        name: `#Inserted Lines (${author})`,
        meta: [`Inserted Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: modifiedFiles.map(entry => entry.file),
        y: modifiedFiles.map(entry => entry.modifications),
        type: 'bar',
        name: `#Modified Lines (${author})`,
        meta: [`Modified Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: deletionFiles.map(entry => entry.file),
        y: deletionFiles.map(entry => entry.deletions),
        type: 'bar',
        name: `#Deleted Lines (${author})`,
        meta: [`Deleted Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
    })

    resolve(visualisation.plot(traces,
      {
        barmode: 'stack',
        title: 'Files per Operation Number',
        xaxis: {
          title: {
            text: 'Filename'
          }
        },
        yaxis: {
          title: {
            text: 'Number of operations'
          }
        }
      }))
  })
}
