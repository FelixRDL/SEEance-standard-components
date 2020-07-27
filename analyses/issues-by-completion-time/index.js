const moment = require('moment')

module.exports = async function (input, config, visualisation) {
  function filterByWhitelist(array, whitelist) {
    console.log(array)
    return array.filter(i => i.labels
        .map(l => l.name)
        .reduce((acc, name)=> {
          if(whitelist.includes(name)) {
            return true
          }
        },false))
  }


  return new Promise((resolve, reject) => {
    let myIssues = input.issues;
    if(config && config.labels_contain && config.labels_contain.length > 0)
      myIssues = filterByWhitelist(myIssues, config.labels_contain)
    if(config && config.name_contains && config.name_contains.length > 0)
      myIssues = filterByWhitelist(myIssues, config.name_contains)


    // console.log(input.issues)
    let timeAlive = myIssues.map(issue => {
      return {
        completionTime: moment.duration(moment(issue.closed_at).diff(moment(issue.created_at))).asDays(),
        issuesName: issue.title
      }
    }).sort((a,b) => a.completionTime - b.completionTime)

    resolve(visualisation.plot([
      {
        x: timeAlive.map(i => i.issuesName),
        y: timeAlive.map(i => i.completionTime),
        type: "bar",
        name: "Issue lifetime"
      }
    ], {
      title: 'Issue Lifetime',
      xaxis: {
        title: {
          text: `Issue Names`
        }
      },
      yaxis: {
        title: {
          text: 'Time until completion (in days)'
        }
      }
    }));
  })
}
