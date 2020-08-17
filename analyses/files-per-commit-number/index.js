function commitsByFilesReducer (acc, commit) {
  if (!commit.filesChanged) { return acc }
  const files = commit.filesChanged
  const result = acc
  files.forEach((file) => {
    if (!result[file.file]) {
      result[file.file] = [commit]
    } else {
      result[file.file].push(commit)
    }
  })
  return result
}

function commitsByFilesAndAuthorsMapper (acc, commit) {
  if (!acc[commit.author_name]) {
    acc[commit.author_name] = { files: {} }
  }
  const authorStat = acc[commit.author_name]
  commit.filesChanged.map((f) => {
    if (!authorStat.files[f.file]) {
      authorStat.files[f.file] = 0
    }
    authorStat.files[f.file] += 1
  })
  return acc
}

module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const standardColors = [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf'
    ]

    const commitsForFiles = input.commits.reduce(commitsByFilesReducer, {})
    if (commitsForFiles['/dev/null']) {
      delete commitsForFiles['/dev/null']
    }

    const commitsByAuthors = input.commits.reduce(commitsByFilesAndAuthorsMapper, {})

    const files = Object.keys(commitsForFiles)
      .sort((k, i) => commitsForFiles[k].length - commitsForFiles[i].length)
      .filter(f => f !== '/dev/null')

    const plots = [{
      x: files,
      y: files.map(f => 0),
      type: 'bar',
      name: 'total',
      showlegend: false,
      hoverinfo: 'none'
    }].concat(Object.keys(commitsByAuthors).sort((a, b) => a.toLowerCase() <= b.toLowerCase() ? -1 : 1).map((k, i) => {
      const xs = Object.keys(commitsByAuthors[k].files)
        .filter(f => f !== '/dev/null')
      return {
        name: k,
        x: xs,
        y: Object.keys(commitsByAuthors[k].files)
          .filter(f => f !== '/dev/null')
          .map(f => commitsByAuthors[k].files[f]),
        type: 'bar',
        marker: {
          color: standardColors[i % standardColors.length]
        }
      }
    }))

    resolve(visualisation.plot(plots, {
      barmode: 'stack',
      title: 'Files per Commit Number',
      xaxis: {
        title: {
          text: 'Filename'
        },
        automargin: true
      },
      yaxis: {
        title: {
          text: 'Number of commits'
        }
      }
    }))
  })
}
