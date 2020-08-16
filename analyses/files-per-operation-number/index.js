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
      const files = Object.keys(groupedDiffs)
      traces.push({
        x: files,
        y: files.map(file => groupedDiffs[file].map(diff => diff.insertions).reduce(sumReducer, 0)),
        type: 'bar',
        name: `#Inserted Lines (${author})`,
        meta: [`Inserted Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: files,
        y: files.map(file => groupedDiffs[file].map(diff => diff.modifications).reduce(sumReducer, 0)),
        type: 'bar',
        name: `#Modified Lines (${author})`,
        meta: [`Modified Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: files,
        y: files.map(file => groupedDiffs[file].map(diff => diff.deletions).reduce(sumReducer, 0)),
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
