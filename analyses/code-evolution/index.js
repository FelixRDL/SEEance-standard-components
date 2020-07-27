module.exports = async function (input, config, visualisation) {
  function filterTimeRange (date, min, max) {
    if (min && date < min) {
      return false
    } else if (max && date > max) {
      return false
    } else {
      return true
    }
  }

  return new Promise((resolve, reject) => {
    const commits = input.commits
      .sort((a, b) => a.date <= b.date ? -1 : 1)
      .filter(c.date => filterTimeRange(c, config.start_date, config.end_date))
    const diff = commits.map(c => { return c.additions - c.deletions })
    const xs = commits.map(c => c.date)
    const ys = diff.map((d, i) => diff.slice(0, i).reduce((a, b) => a + b, 0))
    const yDels = commits.map((c, i) => commits.slice(0, i).reduce((a, b) => a + b.deletions, 0))
    const yAdds = commits.map((c, i) => commits.slice(0, i).reduce((a, b) => a + b.additions, 0))
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'scatter',
        name: 'LOC',
        line: {
          color: 'blue'
        }
      }, {
        x: xs,
        y: yDels,
        type: 'scatter',
        name: 'Summed Deletions',
        line: {
          color: 'red'
        }
      }, {
        x: xs,
        y: yAdds,
        type: 'scatter',
        name: 'Summed Additions',
        line: {
          color: 'green'
        }
      }
    ], {
      title: 'Project Evolution in LOC',
      xaxis: {
        title: {
          text: 'Time'
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
