module.exports = async function (input, config, visualisation) {
  const blame = input.blame;
  authors = blame.reduce((acc, b) => {
    const fileAuthors = Object.keys(b.linesPerAuthor)
    return new Set([...acc, ...new Set(fileAuthors)])
  }, new Set())
    const dict = Array.from(authors).reduce((acc, a) => {
        acc[a] = {
            x: [],
            y: [],
            type: 'bar',
            name: a
        }
        return acc
    }, {})
    blame.forEach((b) => {
        const authors = Object.keys(b.linesPerAuthor)
        authors.forEach(author => {
            dict[author].x.push(b.file)
            dict[author].y.push(b.linesPerAuthor[author])
        })
    })
    const result = Object.keys(dict).map(k => dict[k])



  return new Promise((resolve, reject) => {
    resolve(visualisation.plot(
        result, {
      title: "Project Evolution in LOC",
            barmode: "stack"
    }));
  })
}
