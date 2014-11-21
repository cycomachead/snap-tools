#! /usr/bin/env node

// nodeJS script to download and save the project XML to the current directory
// Usage: get-url [UserName] [Project Name]

var fs = require('fs');
var https = require('https');

var args = process.argv;

// Args Format: node <file> [paramaters]
if (args.length < 4) {
    console.log('Usage: node get-url.js <USERNAME> <PROJECT NAME> [filename]');
    console.log('[filename] is optional; do not provide an extension');
    process.exit(0);
}

var user = args[2];
var proj = args[3];
var file = args[4];

var baseURL = 'https://snapcloud.miosoft.com/miocon/app/login?_app=SnapCloudPublic';

function getURL(user, proj) {
    user = encodeURIComponent(user);
    proj = encodeURIComponent(proj);
    return baseURL + '&Username=' + user + '&ProjectName=' + proj;
}

function getProject(url, filename) {
    // Parameters retuned from the cloud. Used for filename if none provided
    var cloudProj = '';
    var cloudDate = '';
    var cloudData = '';
    
    
    function handleError(e) {
          console.error('ERROR:\n\t' + e);
          process.exit(1);
    }
    
    // Take in an encoded cloud response and write the file
    function writeData(d) {
        data = d.toString();
        if (data.indexOf('ERROR') === 0) {
            // Snapcloud returns success events for errors..wat.
            handleError(d);
        }
        
        data = data.split('&');
        // Response Sections
        // ProjectName=X&Updated=X&SourceCode=X
        // TODO: Clean all this up with a map()
        cloudProj = data[0].split('='); // ProjectName=X
        cloudDate = data[1].split('='); // Updated=X
        cloudData = data[2].split('='); // SourceCode=X
        cloudProj = decodeURIComponent(cloudProj[1]);
        cloudDate = decodeURIComponent(cloudDate[1]);
        cloudData = decodeURIComponent(cloudData[1]);
        filename = filename || (user + '__' + cloudProj + '__' + cloudDate);
        filename += '.xml';
        fs.writeFileSync(filename, cloudData);
    }

    function processData(response) {
        // Don't need to worry about chunked encoding because content-length
        // is specified by the Snap! could server
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        
        response.on('end', function() { writeData(data); });
    }
    
    https.get(url, processData).on('error', handleError);
}

// Do the Call
var url = getURL(user, proj);
getProject(url, file);