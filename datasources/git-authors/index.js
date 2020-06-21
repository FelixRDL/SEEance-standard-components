const git = require('simple-git');
module.exports = async function (localPath, token = undefined) {
    return new Promise(async (resolve, reject) => {
        const log = await git(localPath).log();
        var authors = log.all.map((l) => {
            return {
                name: l['author_name'],
                email: l['author_email']
            }
        });
        authors = authors.reduce(function(acc, curr){
            return acc[curr['name']] = curr;
        }, {});
        resolve(authors);
    });
}