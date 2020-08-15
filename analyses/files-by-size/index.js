module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const accumulatedBlames = input.blame.map((blame) => {
      return {
        file: blame.file,
        loc: Object.keys(blame.linesPerAuthor).reduce((acc, authorName) =>
          acc + blame.linesPerAuthor[authorName], 0)
      }
    }).sort((a, b) => a.loc - b.loc)
    const ys = accumulatedBlames.map(blame => blame.loc)
    const xs = accumulatedBlames.map(blame => blame.file)
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'bar',
        name: 'File sizes (LOC)'
      }
    ], {
      title: 'File sizes in Project',
      xaxis: {
        title: {
          text: 'Filename'
        }
      },
      yaxis: {
        title: {
          text: 'LOC'
        }
      }
    }))
  })
}
