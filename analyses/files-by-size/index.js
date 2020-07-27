module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const visualizeBy = (config && config.dimension) ? config.dimension : 'lines'
    let files = input.files
    let ys
    if(visualizeBy === 'lines') {
      files = files.sort((a, b) => a.lines >= b.lines ? 1 : -1)
      ys = files.map((file) => file.lines)
    } else {
      files = files.sort((a, b) => a.stats.size >= b.stats.size ? 1 : -1)
      ys = files.map((file) => file.stats.size)
    }
    const xs = files.map((file) => file.file)
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'bar',
        name: `File sizes (${visualizeBy})`
      }
    ], {
      title: `File sizes in Project (${visualizeBy})`,
      xaxis: {
        title: {
          text: 'Filename'
        }
      },
      yaxis: {
        title: {
          text: `${visualizeBy}`
        }
      }
    }))
  })
}
