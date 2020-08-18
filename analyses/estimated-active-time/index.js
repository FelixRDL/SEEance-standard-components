const moment = require('moment')

module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const maxInteval = config && config.maxInterval ? config.maxInterval : 60
    const estimatedFirstCommitTime = config && config.estimatedFirstCommitTime ? config.estimatedFirstCommitTime : 30

    const commitsByAuthor = input.commits.reduce((acc, c) => {
      if (!acc[c.author_name]) {
        acc[c.author_name] = []
      }
      acc[c.author_name].push(c)
      return acc
    }, {})
    const authors = Object.keys(commitsByAuthor).sort((a, b) => a.toLowerCase() <= b.toLowerCase() ? -1 : 1)
    const workSessions = authors.map(k => {
      // Sort Commits by Date
      const sortedCommitsForAuthor = commitsByAuthor[k].sort((c1, c2) => c1.date <= c2.date ? 1 : -1)
      return sortedCommitsForAuthor.reduce((acc, currCommit) => {
        if (acc.lastCommit) {
          const currDate = moment(currCommit.date)
          const lastDate = moment(acc.lastCommit.date)
          const interval = moment.duration(lastDate.diff(currDate)).asMinutes()
          if (interval > maxInteval) {
            acc.workSessions.push([currCommit])
          } else {
            acc.workSessions[acc.workSessions.length - 1].push(currCommit)
          }
        } else {
          acc.workSessions.push([currCommit])
        }
        acc.lastCommit = currCommit
        return acc
      }, {
        lastCommit: undefined,
        workSessions: []
      })
    }).map(e => e.workSessions)
    const workSessionDurationsInMinutesPerAuthor =
            workSessions.map(wsForAuthor =>
              wsForAuthor.map(w =>
                moment.duration(moment(w[0].date).diff(moment(w[w.length - 1].date))).asMinutes() + estimatedFirstCommitTime
              )
            )

    const totalTimeInvestedByAuthor = workSessionDurationsInMinutesPerAuthor.map(w => w.reduce((acc, d) => acc + d, 0)).map(t => t / 60)
    const plots = authors.map((author, i) => {
      return {
        x: [author],
        y: [totalTimeInvestedByAuthor[i]],
        type: 'bar',
        name: author
      }
    })
    console.log(plots)

    resolve(visualisation.plot(
      plots, {
        title: 'Estimated Coding Time<br><sub>Coding time per author estimated through commit activity</sub>',
        xaxis: {
          title: {
            text: 'Author'
          }
        },
        yaxis: {
          title: {
            text: 'Estimated Time'
          }
        }
      }))
  })
}
