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
const program = require('commander');
const _ = require('lodash');
const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');
const path = require('path');
const mkdirp = require('mkdirp');

const flags = { output: 'json' };


const templatePath = "./site_templates/";
const resultPath = "./json_results/";

program
    .option('-u, --url <url>', 'The url to audit')
    .option('-s, --site <site>', 'The site to audit')
    .parse(process.argv);


if (program.url) console.log("The following url will be audited" + program.url);
if (program.site) {
    var promise = new Promise(function (resolve, reject) {
        fs.readdir(templatePath, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var siteTemplates = [];
                var count = 0;

                data = _.reject(data, dataItem => /\.gitignore/.test(dataItem));

                var dataCount = data.length;

                data.forEach(function (siteTemplateFile) {
                    fs.readFile(templatePath + siteTemplateFile, 'utf8', function (err, data) {
                        if (err) {
                            reject(err + "Unable to read site template file.");
                        } else {

                            siteTemplates = siteTemplates.concat(JSON.parse(data));
                            count++;

                            if (count == dataCount) {
                                if (siteTemplates.length > 0) {
                                    resolve(siteTemplates);
                                }
                            }
                        }
                    });
                });
            }
        });
    });

    promise.then(function (sitesSettings) {
        if (program.site == "all") {

            _.forEach(sitesSettings, function (site) {
                _.forEach(site.page, function (page) {
                    createJSONResult(site.url, page.path, page.pagename);
                });
            });
        } else {
            var selectedSite = _.filter(sitesSettings, ['sitename', program.site]);

            console.log(selectedSite);
            for (var i = 0; i < page.length; i++) {
                console.log("bob")
                if (typeof a[i].hasOwnProperty(key)) {
                    console.log(a[i][key]);
                }
                //createJSONResult(selectedSite.url, selectedSite.url, page);
            }
        }
    })

}

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
    return chromeLauncher.launch().then(chrome => {
        flags.port = chrome.port;
        return lighthouse(url, flags, config).then(results =>
            chrome.kill().then(() => results));
    });
}


function createJSONResult(rootUrl, pageUrl, pageName) {
    var testURL = rootUrl + pageUrl;
    testURL = testURL.replace(/([^:]\/)\/+/g, "$1");

    launchChromeAndRunLighthouse(testURL, flags).then(results => {
        // Use results!
        var jsonResults = JSON.stringify(results);
        // This solution is disgusting make it to one regex!!!
        var domainName = rootUrl.replace(/(http(s?))\:\/\//, "").replace(/(\/)/, "").replace(/\./g, "_");

        var jSONResultPath = resultPath + domainName + "/" + pageName;

        mkdirp(jSONResultPath, 0744, function (e) {
            if (e) {
                console.log(e);
            }
            else {
                fs.writeFile(jSONResultPath + "/" + domainName + "_" + Date.now() + '.json', jsonResults, function (e) {
                    if (e) {
                        return console.log(e);
                    }
                });
            }
        })
    });
}