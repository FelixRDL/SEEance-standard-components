const {Octokit} = require("@octokit/rest");
module.exports = async (owner, repo, token=undefined) => {
    return new Promise(async (resolve, reject) => {
        var octo;
        if(token) {
            octo = new Octokit({
                auth: `token ${token}`
            });
        } else {
            octo = new Octokit();
        }
        try {
            const issues = (await octo.paginate(octo.issues.listForRepo, {
                owner: owner,
                repo: repo,
                state: 'all'
            })).filter(issue => !issue['pull_request']);
            resolve(issues);
        } catch (e) {
            reject(e);
        }
    });
}