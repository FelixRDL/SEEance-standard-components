const TICK_TRUNCATE_MAX = 10

function truncate (s, MAX_LENGTH) {
  return s.length > MAX_LENGTH ? '...' + s.substring(s.length - MAX_LENGTH - 4, s.length) : s
}

function blameMapper (blame) {
  return {
    file: blame.file,
    loc: Object.keys(blame.linesPerAuthor).reduce((acc, authorName) =>
      acc + blame.linesPerAuthor[authorName], 0)
  }
}

module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const accumulatedBlames = input.blame.map(blameMapper).sort((a, b) => a.loc - b.loc < 0 ? -1 : 1)
    const ys = accumulatedBlames.map(blame => blame.loc)
    const xs = accumulatedBlames.map(blame => blame.file)
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        text: xs,
        type: 'bar',
        name: 'File sizes (LOC)'
      }
    ], {
      title: 'File sizes in Project',
      xaxis: {
        title: {
          text: 'Filename'
        },
        tickvals: xs,
        ticktext: xs.map(x => truncate(x, TICK_TRUNCATE_MAX)),
        automargin: true
      },
      yaxis: {
        title: {
          text: 'LOC'
        }
      }
    }))
  })
}
