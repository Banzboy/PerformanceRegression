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
const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');

program
    .option('-u, --url <url>', 'The url to audit')
    .option('-s, --site <site>', 'The site to audit')
    .parse(process.argv);

if (program.url) console.log("The following url will be audited" + program.url);
if (program.site) console.log("The following site will be audited" + program.site);

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
    return chromeLauncher.launch().then(chrome => {
        flags.port = chrome.port;
        return lighthouse(url, flags, config).then(results =>
            chrome.kill().then(() => results));
    });
}

const flags = { output: 'json' };

// Usage:
launchChromeAndRunLighthouse(program.url, flags).then(results => {
    // Use results!

    // TODO: Read template values to run audits per page on a site.

    // This solution is disgusting make it to one regex!!!
    var domainName = program.url.replace(/(http(s?))\:\/\//, "").replace(/(\/)/, "").replace(/\./g, "_");

    var resultPath = "./json_results/" + domainName;

    ensureExists(resultPath, 0744, function (e) {
        if (e) {
            console.log("Existing site directory found.");
        }
        else {
            fs.mkdir(resultPath, function (err) {
                if (err) {
                    console.log("Directory not found.")
                } else {
                    fs.writeFile(resultPath + "/" + domainName + "_" + Date.now() + '.json', results, function (e) {
                        if (e) {
                            return console.log(e);
                        }
                    });
                }
            });
        }
    })
});

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function (err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}