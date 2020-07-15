module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const files = input.files.sort((a,b) => a.stats.size >= b.stats.size ? 1:-1 );
    const xs = files.map((file) => file.file)
    const ys = files.map((file) => file.stats.size)
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'bar',
        name: 'Changed Files per Commit'
      }
    ], {
      title: "File sizes in Project"
    }));
  })
}
