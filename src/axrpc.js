#!/usr/bin/env node

const handlebars = require('handlebars');
const fs = require('fs');
const { program } = require('commander');

const http = require('http');

function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and an optional radix
  return parseInt(value);
}

function optIntParser(def) {
    return function(val, dummyPrevious) {
        return parseInt(val) || def;
    }
}



program
    .option('-j, --json <url>', 'json path', "http://localhost:8080/ax-rpc/v1/description.json")
    .option('-o, --output <path>', 'output folder')
    .option('-v, --verbose', 'verbose', false)
    .option('-p, --entryPoint <text>', 'Add additional Path')
    .option('-n, --protobufNs <text>', 'Default protobuf namespace', 'com.axgrid.rpc')
    .option('--retryCount <number>', 'Retry Count', optIntParser(10))
    .option('--retryTimeout <number>', 'Retry Delay', optIntParser(200))
    .option('--serviceName <text>', 'Create single Service class')
    .option('--serviceName <text>', 'Create single Service class')
    .option('-e, --excludeCommon', 'Exclude Common', false)

program.parse(process.argv);
if (program.opts().verbose) console.log(program.opts());
if (program.opts().verbose) console.log("DIR:", __dirname);

handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('ifUnless', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});


handlebars.registerHelper('uncapitalize', function (str1){ return str1.charAt(0).toLowerCase() + str1.slice(1); })



function render(jsonData) {
	fs.readFile(__dirname + '/axrpc.hbs', function(err, data){
      if (!err) {
        const source = data.toString();
        const res = renderToString(source, jsonData);
        if (program.opts().verbose) console.log(res);
        if (program.opts().output) fs.writeFile(program.opts().output, res, function(err) {
          if (err) console.error("IO.Err", err);
        });
      } else {
        console.error("IO.Err", err);
      }
    });

}

// this will be called after the file is read
function renderToString(source, data) {
    const template = handlebars.compile(source);
    if (program.opts().verbose) console.log("Data is", data)
  return template({services: data, opt: program.opts()});
}

http.get(program.opts().json, (resp) => {
	let data = '';
	resp.on('data', (chunk) => { data += chunk; });
	resp.on('end', () => {
		//console.log("Data", data)
    	//console.log("result", JSON.parse(data).explanation);
        render(JSON.parse(data))
  	});
}).on("error", (err) => {
  console.error("Error: " + err.message);
});


