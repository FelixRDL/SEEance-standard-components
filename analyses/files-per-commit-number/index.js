module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const commitsForFiles = input.commits.reduce((acc, commit) => {
      if(!commit.diff)
        return acc
      const files = commit.diff.files;
      const result = acc;
      files.forEach((file) => {
        if(!result[file.file]) {
          result[file.file] = [commit]
        } else {
          result[file.file].push(commit)
        }
      })
      return result
    }, {})

    let result = Object.keys(commitsForFiles).map((fileName) => {
      return {
        x: fileName,
        y: commitsForFiles[fileName].length
      }
    }).sort((a,b) => a.y >= b.y ? 1 : -1 )
    if(config && config.max_number_of_results && config.max_number_of_results < result.length)
      result = result.splice(-config.max_number_of_results)

    resolve(visualisation.plot([
      {
        x: result.map((r) => r.x),
        y: result.map((r) => r.y),
        type: 'bar',
        name: 'Commits for File'
      }
    ], {
      title: "Files per Commit Number"
    }));
  })
}
