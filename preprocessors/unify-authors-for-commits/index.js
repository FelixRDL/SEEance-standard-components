module.exports = async function (input, config) {
  return new Promise((resolve, reject) => {
    const mappingDictNames = {}
    const mappingDictEMails = {}
    function initializeDict (commits) {
      if (config && config.mappings) {
        config.mappings.map(mapping => {
          const properName = mapping.properName
          const aliases = mapping.aliases.split(';')
          const entriesForProperName = commits.filter(c => c.author_name === properName)
          let entry
          if (entriesForProperName.length > 0) {
            entry = entriesForProperName[0]
          }
          aliases.map(alias => {
            if (entry) {
              mappingDictNames[alias] = entry.author_name
              mappingDictEMails[alias] = entry.author_email
            } else {
              mappingDictNames[alias] = properName
            }
          })
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
