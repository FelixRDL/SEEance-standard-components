module.exports =  async function(input, config, visualisation) {
    return new Promise(async (resolve, reject) => {
        var issuesByUsers = {};
        for(let issue of input.issues) {
            if(!issuesByUsers[issue.user.login])
                issuesByUsers[issue.user.login] = [];
            issuesByUsers[issue.user.login].push(issue);
        }
        xs = [];
        ys = [];
        Object.keys(issuesByUsers).map(function(userName){
            xs.push(userName);
            ys.push(issuesByUsers[userName].length);
        }, {});

        resolve(visualisation.plot([
            {
                x: xs,
                y: ys,
                type: "bar",
                name: "Something"
            }
        ], {}));
    });
}