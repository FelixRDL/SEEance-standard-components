module.exports = async function (input, config, visualisation) {
    return new Promise((resolve, reject) => {
        let diff = input.commits.map(c => {return c.additions - c.deletions})
        const xs = input.commits.map(c => c.date);
        const ys = diff.map((d, i) => diff.slice(0, i).reduce((a, b) => a+b, 0))
        const yDels = input.commits.map((c, i) => input.commits.slice(0, i).reduce((a, b) => a+b.deletions, 0))
        const yAdds = input.commits.map((c, i) => input.commits.slice(0, i).reduce((a, b) => a+b.additions, 0))
        resolve(visualisation.plot([
            {
                x: xs,
                y: ys,
                type: 'scatter',
                name: 'LOC'
            }, {
                x: xs,
                y: yDels,
                type: 'scatter',
                name: 'Summed Deletions'
            },  {
                x: xs,
                y: yAdds,
                type: 'scatter',
                name: 'Summed Additions'
            }
        ], {
            title: "Project Evolution in LOC",
            xaxis: {
                title: {
                    text: `Time`
                }
            },
            yaxis: {
                title: {
                    text: 'Number of operations'
                }
            }
        }));
    })
}
