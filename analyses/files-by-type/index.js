const groupBy = require('lodash').groupBy;

module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const filesByType = groupBy(input.files, (v) => v.file.split('.').splice(-1)[0]);
    let results = Object.keys(filesByType).map((x) => {
      return {
        x: x,
        y: filesByType[x].length
      }
    }).sort((a, b) => a.y >= b.y ? 1:-1)

    if(config && config['max_number_of_results'] && results.length > config['max_number_of_results']) {
      results = results.splice(-config['max_number_of_results'])
    }

    const xs = results.map(r => r.x)
    const ys = results.map(r => r.y)



    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'bar',
        name: 'Number of Files By Extension'
      }
    ], {
      title: "Number of Files By Extension",
      xaxis: {
        title: {
          text: `Extension Name`
        }
      },
      yaxis: {
        title: {
          text: 'Number of files'
        }
      }
    }));
  })
}
