module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const commits = input.commits
    const authorContribs = commits.reduce((acc, commit) => {
      const author = commit.author_name
      if (!acc[author]) { acc[author] = new Set() }
      commit.filesChanged.forEach(fileChanged => acc[author].add(fileChanged.file))
      return acc
    }, {})
    const authors = Object.keys(authorContribs).sort((a,b) => a <= b ? -1 : 1)
    const plots = authors.map((a) => {
      return {
        x: Array.from(authorContribs[a]),
        y: Array.from(authorContribs[a]).map(c => 1),
        type: 'bar',
        name: a
      }
    })

    resolve(visualisation.plot(plots, {
      barmode: 'stack',
      title: 'Number of Distinct Authors per File',
      xaxis: {
        title: {
          text: 'Filename'
        }
      },
      yaxis: {
        title: {
          text: 'Number of distinct authors'
        }
      }
    }))
  })
}
