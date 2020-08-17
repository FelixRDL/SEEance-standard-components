const TICK_TRUNCATE_MAX = 10

function truncate (s, MAX_LENGTH) {
  return s.length > MAX_LENGTH ? '...' + s.substring(s.length - MAX_LENGTH - 4, s.length) : s
}

function authorSetReducer (acc, blame) {
  const fileAuthors = Object.keys(blame.linesPerAuthor)
  return new Set([...acc, ...new Set(fileAuthors)])
}

function authorToTraceReducer (acc, authorName) {
  acc[authorName] = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    name: authorName
  }
  return acc
}

function linesForAllKeysCounter (dict) {
  return Object.keys(dict).reduce((acc, key) => acc + dict[key], 0)
}

module.exports = async function (input, config, visualisation) {
  const blame = input.blame
  const authorSet = blame.reduce(authorSetReducer, new Set())
  const authors = Array.from(authorSet).sort((a, b) => a.toLowerCase() <= b.toLowerCase() ? -1 : 1)
  const dict = authors.reduce(authorToTraceReducer, {})
  blame.forEach((b) => {
    const authors = Object.keys(b.linesPerAuthor)
    authors.forEach(author => {
      dict[author].x.push(b.file)
      dict[author].text.push(b.file)
      dict[author].y.push(b.linesPerAuthor[author])
    })
  })
  const result = Object.keys(dict).map(k => dict[k])
  const tickvals = blame.sort((blameA, blameB) => {
    return linesForAllKeysCounter(blameA.linesPerAuthor) - linesForAllKeysCounter(blameB.linesPerAuthor) < 0 ? 1 : -1
  }).map(blame => blame.file)
  const ticktexts = tickvals.map(s => truncate(s, TICK_TRUNCATE_MAX))

  return new Promise((resolve, reject) => {
    resolve(visualisation.plot(
      result, {
        title: 'Ownership By File',
        barmode: 'stack',
        xaxis: {
          automargin: true,
          title: {
            text: 'Filename'
          },
          tickvals: tickvals,
          ticktext: ticktexts,
          categoryarray: tickvals,
          categoryorder: 'array'
        },
        yaxis: {
          title: {
            text: 'Lines created by author'
          }
        }
      }))
  })
}
