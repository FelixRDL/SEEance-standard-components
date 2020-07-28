module.exports = async function (input, config, visualisation) {
  return new Promise((resolve, reject) => {
    const distinctAuthors = Array.from(new Set(input.commits.map(c => c.author_name)))
    const totalInsertionsAuthors = distinctAuthors.map(a => {
      const commits = input.commits.filter(c => c.author_name === a)
      return commits.reduce((acc, c) => c.additions+acc, 0)
    })
    const lines = input.blame.map(b => b.linesPerAuthor)
    const linesAlivePerAuthor = distinctAuthors.map(a => lines.reduce((acc, b) => acc + (b[a] ? b[a] : 0), 0))
    const survivalPerAuthor = distinctAuthors.map((a, i) => {
      return linesAlivePerAuthor[i] / totalInsertionsAuthors[i]
    })

    console.log(distinctAuthors, linesAlivePerAuthor, totalInsertionsAuthors)

    resolve(visualisation.plot([
      {
        x: distinctAuthors,
        y: survivalPerAuthor,
        type: 'bar',
        name: 'Code Survival Rate Per Autor'
      }
    ], {
      title: "Code Survival Rate",
      xaxis: {
        title: {
          text: `Time in ${timeFrame}s`
        }
      },
      yaxis: {
        title: {
          text: 'Number of commits'
        }
      }
    }));
  })
}
