#!/usr/bin/env node

// Codename: Pharos

// Read program config with custom settings to determine what the application will do

// Run program based on CLI 
// Example commands:
// - audit http://www.bobharing.nl/
// - audit bobharing
//      - bobharing results with reading a json file which has the all the urls for the website that are to be audited

// Place JSON results in correct directories
// Read JSON results and with VUE display results in a web interface.
// Compare metrics of two audits with each other with visualization of said m

/// Load modules
var program = require('commander');
const exec = require('child_process').exec;
const fs = require('fs');

program
    .option('-u, --url <url>', 'The url to audit')
    .option('-s, --site <site>', 'The site to audit')
    .parse(process.argv);

if (program.url) console.log("The following url will be audited" + program.url);
if (program.site) console.log("The following site will be audited" + program.site);

// call lighthouse command and print json results to new directory after every run
var lighthouseConfig = "";

// if output json?
lighthouseConfig = " --output=json";

// Create new directory for result, TODO: automatically add site specific folders before the date folder (base the folder name on the url or site name)
var resultPath = "./json_results/" + Date.now() + "/";
fs.mkdirSync(resultPath);
lighthouseConfig += " --output-path=" + resultPath + "report.json";

var cmd = 'lighthouse ' + program.url + lighthouseConfig;

console.log("Running command for lighthouse: " + cmd);

exec(cmd, function (error, stdout, stderr) {
    // if error undo creating new stuff

    console.log(error);
    console.log(stdout);
    console.log(stderr);
});