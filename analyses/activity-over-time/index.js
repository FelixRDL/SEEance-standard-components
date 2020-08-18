const moment = require('moment')
const lodash = require('lodash')
module.exports = async function (input, config, visualisation) {
  function getMinDate (commits) {
    const dates = commits.map(c => c.date).sort((a, b) => a >= b ? 1 : -1)
    return dates[0]
  }

  function getMaxDate (commits) {
    const dates = commits.map(c => c.date).sort((a, b) => a >= b ? 1 : -1)
    return dates.splice(-1)[0]
  }

  function getWeeksBetween (dateFrom, dateTo) {
    var weeks = []
    var startDate = moment(dateFrom).isoWeekday(8)
    if (startDate.date() === 8) {
      startDate = startDate.isoWeekday(-6)
    }
    while (startDate.isBefore(moment(dateTo))) {
      startDate.add(7, 'days')
      weeks.push(`${startDate.year()}-W${startDate.week()}`)
    }
    return weeks
  }

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
      .filter(item => filterTimeRange(item.date, config.start_date, config.end_date))
    const weeks = getWeeksBetween(getMinDate(commits), getMaxDate(commits))
    const timeFrame = config && config.time_frame ? config.time_frame : 'day'
    const commitsByAuthor = lodash.groupBy(commits, c => c.author_name)
    const authors = Object.keys(commitsByAuthor).sort((a, b) => a.toLowerCase() <= b.toLowerCase() ? -1 : 1)
    let format = 'YYYY-MM-DD HH'
    switch (timeFrame) {
      case 'hour':
        format = 'YYYY-MM-DD HH'
        break
      case 'day':
        format = 'YYYY-MM-DD'
        break
      case 'month':
        format = 'YYYY-MM'
        break
      case 'year':
        format = 'YYYY'
        break
    }
    var authorPlots = authors.map((author) => {
      const commitsByTime = lodash.groupBy(commitsByAuthor[author], c => {
        if (timeFrame === 'week') {
          // Solution by YouneL, https://stackoverflow.com/questions/48083728/group-dates-by-week-javascript
          return `${moment(c.date).year()}-W${moment(c.date).week()}`
        } else {
          return moment(c.date).format(format)
        }
      })
      const xs = timeFrame !== 'week' ? Object.keys(commitsByTime).sort((a, b) => a >= b ? 1 : -1) : weeks
      return {
        x: xs,
        y: xs.map(k => commitsByTime[k] ? commitsByTime[k].length : 0),
        type: 'bar',
        name: `${author}`
      }
    })
    resolve(visualisation.plot(authorPlots, {
      title: 'Activity Over Time<br><sub>Number of commits by authors over time</sub>',
      xaxis: {
        title: {
          text: 'Time'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Commits'
        }
      }
    }))
  })
}
