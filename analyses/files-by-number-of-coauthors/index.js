module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const commits = input.commits;
    const filesWithCoauthors = commits.reduce((acc, commit) => {
      const result = acc;
      if(!commit.filesChanged)
        return result;
      const files = commit.filesChanged
      files.forEach(fileChange => {
        if(!acc[fileChange.file])
          acc[fileChange.file] = new Set()
        result[fileChange.file].add(commit.author_name)
      })
      return result;
    }, {})
    let results = Object.keys(filesWithCoauthors).map((f) => {
      return {
        x: f,
        y: filesWithCoauthors[f].size,
        authors: filesWithCoauthors[f]
      }
    }).sort((a, b) => a.y >= b.y ? 1 : -1)

    if(config && config.max_number_of_results && config.max_number_of_results < results.length) {
      results = results.splice(-config.max_number_of_results)
    }

    resolve(visualisation.plot([
      {
        x: results.map(r => r.x),
        y: results.map(r => r.y),
        type: 'bar',
        name: 'Number of Commiters'
      }
    ], {
      title: "Number of Distinct Commiters per File"
    }));
  })
}
