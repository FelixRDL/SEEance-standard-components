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

function cumulateDiffsByTypeMapper (groupedDiffs, type) {
  return Object.keys(groupedDiffs).map((file) => {
    const result = {}
    result.file = file
    result[type] = groupedDiffs[file].map(diff => diff[type]).reduce(sumReducer, 0)
    return result
  }).filter((entry) => entry[type] > 0)
}

function totalOperationsByFileReducer (acc, commit) {
  commit.diff.files.forEach(file => {
    const fileName = file.file
    if (fileName !== '/dev/null') {
      if (!acc[fileName]) {
        acc[fileName] = file.insertions + file.modifications + file.deletions
      } else {
        acc[fileName] += file.insertions + file.modifications + file.deletions
      }
    }
  })
  return acc
}

function getSortedFileNames (dict) {
  return Object.keys(dict).sort((keyA, keyB) => dict[keyA] - dict[keyB] <= 0 ? -1 : 1)
}

module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const diffsByAuthors = input.commits.reduce(groupDiffsByCommiterReducer, {})
    const traces = []
    const xs = getSortedFileNames(input.commits.reduce(totalOperationsByFileReducer, {}))
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
      const insertionFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'insertions')
      const modifiedFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'modifications')
      const deletionFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'deletions')

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
          },
          categoryarray: xs,
          categoryorder: 'array'
        },
        yaxis: {
          title: {
            text: 'Number of operations'
          }
        }
      }))
  })
}
