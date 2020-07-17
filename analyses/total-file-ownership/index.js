module.exports = async function (input, config, visualisation) {
  const blame = input.blame;
  const isNormalizing = config && config.normalize && config.normalize === true
  authors = blame.reduce((acc, b) => {
    const fileAuthors = Object.keys(b.linesPerAuthor)
    return new Set([...acc, ...new Set(fileAuthors)])
  }, new Set())
  const dict = Array.from(authors).reduce((acc, a) => {
    acc[a] = 0
    return acc
  }, {})
  blame.forEach((b) => {
    const authors = Object.keys(b.linesPerAuthor)
    authors.forEach(author => {
      dict[author] += b.linesPerAuthor[author]
    })
  })
  const xs = Object.keys(dict)
  let ys = Object.keys(dict).map(k => dict[k])

  if(isNormalizing) {
    const sum = ys.reduce((a,y) => a+y, 0)
    ys = ys.map(y => y/sum)
  }



  return new Promise((resolve, reject) => {
    resolve(visualisation.plot([
      {
        x: xs,
        y: ys,
        type: 'bar',
        name: isNormalizing ? 'Line Ownership' : 'Proportionate Line Ownership'
      }
    ], {
      title: "Line Ownership in current Project"
    }));
  })
}
