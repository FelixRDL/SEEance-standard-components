module.exports = async function (input, config) {
  return new Promise((resolve, reject) => {
    const mappingDictNames = {}
    const mappingDictEMails = {}
    function initializeDict (commits) {
      if (config && config.mappings) {
        const mappings = config.mappings.split(';')
        mappings.forEach(m => {
          const fromKey = m.split(':')[0]
          const toKey = m.split(':')[1]
          const entriesWithToKey = commits.filter(c => c.author_name === toKey)
          if (entriesWithToKey.length > 0) {
            const entry = entriesWithToKey[0]
            mappingDictNames[fromKey] = entry.author_name
            mappingDictEMails[fromKey] = entry.author_email
          } else {
            mappingDictNames[fromKey] = toKey
          }
        })
      }
    }

    initializeDict(input.commits)

    input.commits = input.commits.map(c => {
      if (mappingDictNames[c.author_name]) {
        c.author_name = mappingDictNames[c.author_name]
        c.author_email = mappingDictEMails[c.author_name] ? mappingDictEMails[c.author_name] : c.author_email
      }
      return c
    })
    resolve(input)
  })
}
