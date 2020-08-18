module.exports = async function (input, config, visualisation) {
  const blame = input.blame
  const authors = blame.reduce((acc, b) => {
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
  const authorsSorted = Object.keys(dict).sort((a, b) => a.toLowerCase() <= b.toLowerCase() ? -1 : 1)

  const plots = authorsSorted.map(a => {
    return {
      x: [a],
      y: [dict[a]],
      type: 'bar',
      name: a
    }
  })
  return new Promise((resolve, reject) => {
    resolve(visualisation.plot(plots, {
      title: 'Total Line Ownership<br><sub>Number of lines created by author</sub>',
      xaxis: {
        title: {
          text: 'Author'
        }
      },
      yaxis: {
        title: {
          text: 'Number of lines'
        }
      }
    }))
  })
}
