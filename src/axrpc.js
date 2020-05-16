#!/usr/bin/env node

const handlebars = require('handlebars');
const fs = require('fs');
const { program } = require('commander');

const http = require('http');

function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and an optional radix
  return parseInt(value);
}

program
  .option('-j, --json <url>', 'json path', "http://localhost:8080/ax-rpc/v1/description.json")
  .option('-o, --output <path>', 'output folder')
  .option('-v, --verbose', 'verbose', false)
  .option('-n, --number <number>', 'num', myParseInt)


program.parse(process.argv);

console.log(program.opts());
handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('ifUnless', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});


handlebars.registerHelper('uncapitalize', function (str1){ return str1.charAt(0).toLowerCase() + str1.slice(1); })



function render(jsonData) {
	fs.readFile('./src/axrpc.hbs', function(err, data){
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
  return template({services: data});
}

http.get('http://localhost:8080/ax-rpc/v1/description.json', (resp) => {
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


