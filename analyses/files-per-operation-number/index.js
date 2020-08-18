const TICK_TRUNCATE_MAX = 10
const MAX_NUMBER_OF_ENTRIES = 30

function truncate (s, MAX_LENGTH) {
  return s.length > MAX_LENGTH ? '...' + s.substring(s.length - MAX_LENGTH - 4, s.length) : s
}

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
  const maxNumberOfResults = config.max_number_of_results || MAX_NUMBER_OF_ENTRIES
  return new Promise((resolve, reject) => {
    const diffsByAuthors = input.commits.reduce(groupDiffsByCommiterReducer, {})
    const traces = []
    const xs = getSortedFileNames(input.commits.reduce(totalOperationsByFileReducer, {}))
    const cappedXs = xs.length > maxNumberOfResults ? xs.slice(xs.length - maxNumberOfResults) : xs
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
      const insertionFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'insertions').filter(entry => cappedXs.includes(entry.file))
      const modifiedFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'modifications').filter(entry => cappedXs.includes(entry.file))
      const deletionFiles = cumulateDiffsByTypeMapper(groupedDiffs, 'deletions').filter(entry => cappedXs.includes(entry.file))

      traces.push({
        x: insertionFiles.map(entry => entry.file),
        y: insertionFiles.map(entry => entry.insertions),
        type: 'bar',
        name: `#Insertions (${author})`,
        meta: [`Inserted Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: modifiedFiles.map(entry => entry.file),
        y: modifiedFiles.map(entry => entry.modifications),
        type: 'bar',
        name: `#Modifications (${author})`,
        meta: [`Modified Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
      traces.push({
        x: deletionFiles.map(entry => entry.file),
        y: deletionFiles.map(entry => entry.deletions),
        type: 'bar',
        name: `#Deletetions (${author})`,
        meta: [`Deleted Lines by ${author}`],
        hovertemplate: '<i>%{x}</i>: %{y}<br>'
      })
    })

    resolve(visualisation.plot(traces,
      {
        barmode: 'stack',
        title: `Operations per File<br><sub>Linewise operations by file (top ${cappedXs.length} or ${xs.length})</sub>`,
        xaxis: {
          title: {
            text: 'File'
          },
          automargin: true,
          tickvals: cappedXs,
          ticktext: cappedXs.map(tick => truncate(tick, TICK_TRUNCATE_MAX)),
          categoryarray: cappedXs,
          categoryorder: 'array'
        },
        yaxis: {
          title: {
            text: 'Number of Operations'
          }
        }
      }))
  })
}
