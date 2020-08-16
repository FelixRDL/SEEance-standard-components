module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const commitsForFiles = input.commits.reduce((acc, commit) => {
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
    }, {})
    if (commitsForFiles['/dev/null']) {
      delete commitsForFiles['/dev/null']
    }

    const commitsByAuthors = input.commits.reduce((acc, commit) => {
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
    }, {})

    const files = Object.keys(commitsForFiles).sort((k, i) => commitsForFiles[k].length - commitsForFiles[i].length)
    const plots = [{
      x: files,
      y: files.map(f => 0),
      type: 'bar',
      name: 'total',
      showlegend: false,
      hoverinfo: 'none'
    }].concat(Object.keys(commitsByAuthors).sort((a,b) => a <= b ? -1 : 1).map(k => {
      return {
        name: k,
        x: Object.keys(commitsByAuthors[k].files),
        y: Object.keys(commitsByAuthors[k].files).map(f => commitsByAuthors[k].files[f]),
        type: 'bar'
      }
    }))

    resolve(visualisation.plot(plots, {
      barmode: 'stack',
      title: 'Files per Commit Number',
      xaxis: {
        title: {
          text: 'Filename'
        }
      },
      yaxis: {
        title: {
          text: 'Number of commits'
        }
      }
    }))
  })
}
