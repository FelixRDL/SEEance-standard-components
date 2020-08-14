module.exports = async function (input, config, visualisation) {

  function addByKeyReducer(acc, item, key) {
    return acc + item[key]
  }

  return new Promise((resolve, reject) => {
    const diffsPerFiles = {}
    input.commits.map(commit => {
      if (commit.diff) {
        commit.diff.files.map(diff => {
          if (!diffsPerFiles[diff.file]) {
            diffsPerFiles[diff.file] = []
          }
          diffsPerFiles[diff.file].push(diff)
        })
      }
    })

    if (diffsPerFiles['/dev/null']) {
      delete diffsPerFiles['/dev/null']
    }

    const fileNames = Object.keys(diffsPerFiles).sort((a, b) => {
      const objA = diffsPerFiles[a]
      const objB = diffsPerFiles[b]
      const sumA = objA.reduce((acc, a) => addByKeyReducer(acc, a, 'insertions'), 0) +
        objA.reduce((acc, a) => addByKeyReducer(acc, a, 'deletions'), 0) +
        objA.reduce((acc, a) => addByKeyReducer(acc, a, 'modifications'), 0)
      const sumB = objB.reduce((acc, a) => addByKeyReducer(acc, a, 'insertions'), 0) +
        objB.reduce((acc, a) => addByKeyReducer(acc, a, 'deletions'), 0) +
        objB.reduce((acc, a) => addByKeyReducer(acc, a, 'modifications'), 0)
      return sumA - sumB > 0 ? 1 : -1
    })
    const insertions = fileNames.map((fn) => {
      return diffsPerFiles[fn].reduce((acc, diff) => addByKeyReducer(acc, diff, 'insertions'), 0)
    })
    const deletions = fileNames.map((fn) => {
      return diffsPerFiles[fn].reduce((acc, diff) => addByKeyReducer(acc, diff, 'deletions'), 0)
    })
    const modifications = fileNames.map((fn) => {
      return diffsPerFiles[fn].reduce((acc, diff) => addByKeyReducer(acc, diff, 'modifications'), 0)
    })
    const plots = [ {
      x: fileNames,
      y: deletions,
      type: 'bar',
      name: 'deletions',
      line: {
        color: 'red'
      }
    }, {
      x: fileNames,
      y: modifications,
      type: 'bar',
      name: 'modifications',
      line: {
        color: 'orange'
      }
    }, {
      x: fileNames,
      y: insertions,
      type: 'bar',
      name: 'insertions',
      line: {
        color: 'green'
      }
    }, {
      x: fileNames,
      y: insertions.map((insertion, index) => insertion - deletions[index]),
      type: 'bar',
      name: 'locs',
      line: {
        color: 'blue'
      }
    }]

    resolve(visualisation.plot(plots, {
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
