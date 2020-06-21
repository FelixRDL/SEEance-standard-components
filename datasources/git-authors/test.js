let git = require('simple-git');
let rimraf = require('rimraf');
const script = require('./index');
const path = './.tmp';

rimraf(path, ()=> {
    git().clone(process.argv[2], path).then(async ()=> {
        const result = await script(path);
        console.log("DATASOURCE TEST:", result);
        rimraf(path, () => {});
    });
});