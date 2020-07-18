module.exports = async function (input, config) {
  return new Promise((resolve, reject) => {
    const mappings = {}
    function initializeDict () {
      if (config && config.mappings) {
        config.mappings.map(mapping => {
          const properName = mapping.properName
          const aliases = mapping.aliases.split(';')
          aliases.map(alias => {
            mappings[alias] = properName
          })
        })
      }
    }
    initializeDict()
    input.blame = input.blame.map(b => {
      b.linesPerAuthor = Object.keys(b.linesPerAuthor).reduce((acc, key) => {
        if (mappings[key]) {
          acc[mappings[key]] = b.linesPerAuthor[key]
        } else {
          acc[key] = b.linesPerAuthor[key]
        }
        return acc
      }, {})
      return b
    })
    resolve(input)
  })
}
