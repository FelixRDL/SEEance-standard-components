module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const resultDict = {}
    input.jscodestats.map(s => {
      resultDict[s.path] = {
        numDependencies: s.dependencies.length,
        maintainability: s.maintainability,
        loc: s.loc,
        cyclomatic: s.cyclomatic,
        effort: s.effort
      }
    })

    const xs = Object.keys(resultDict)
    const plots = []
    if(!config || config.maintainability == true)
      plots.push({
        x: xs,
        y: xs.map(x => resultDict[x].maintainability),
        type: 'bar',
        name: 'Maintainability'
      })
    if(!config || config.numDependencies == true)
      plots.push({
        x: xs,
        y: xs.map(x => resultDict[x].numDependencies),
        type: 'bar',
        name: 'Number Of Dependencies'
      })
    if(!config || config.loc == true)
      plots.push({
        x: xs,
        y: xs.map(x => resultDict[x].loc),
        type: 'bar',
        name: 'Avg. Lines Of Code per Function'
      })
    if(!config || config.cyclomatic == true)
      plots.push({
        x: xs,
        y: xs.map(x => resultDict[x].cyclomatic),
        type: 'bar',
        name: 'Avg. Cyclomatic Complexity per Function'
      })
    if(!config || config.effort == true)
      plots.push({
        x: xs,
        y: xs.map(x => resultDict[x].effort),
        type: 'bar',
        name: 'Avg. Per-Function Halstead Effort'
      })
    resolve(visualisation.plot(plots, {
      title: "JS Code Metrics"
    }));
  })
}
