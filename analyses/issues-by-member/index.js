module.exports =  async function(input, config, visualisation) {
    return new Promise(async (resolve, reject) => {
        /**
         * TODO: Implement your analysis logic here.
         *
         * You can use visualisation to create an html visualisation-
         *
         * Call 'resolve' with the visualisation of your analysis.
         * */


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