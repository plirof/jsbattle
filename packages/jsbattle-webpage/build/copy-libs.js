#!/usr/bin/env node

const cpx = require("cpx");
const fs = require('fs');
const path = require('path');
const Transform = require("stream").Transform

let rawdata = fs.readFileSync(__dirname + "/libs.json");
let libsdata = JSON.parse(rawdata);

console.log(`Copying ${libsdata.length} file sets...`);

function copyAsync(cmdlist) {
  if(cmdlist.length == 0) return;
  let cmd = cmdlist.shift();
  let replaceInfo = '';
  if(cmd.replace) {
    replaceInfo = '(REPLACE)';
  }
  console.log(`  ${cmd.from} -> ${cmd.to} ${replaceInfo}`);
  let from = path.resolve(__dirname + "/../" + cmd.from);
  let to = path.resolve(__dirname + "/../" + cmd.to);
  let opts = {};

  if(cmd.replace) {
    opts.transform = (filename) => new Transform({
      writableObjectMode: true,
      transform(chunk, encoding, callback) {
        let pattern;
        for(let replace of cmd.replace) {
          patten = new RegExp(replace.pattern);
          if(patten.test(filename)) {
            if(process.env[replace.env] === undefined) {
              console.error(`Error: No ENV "${replace.env}" is defined. Replacement for "${replace.match}" in ${filename} cannot be done`);
              process.exit(1);
            }
            let text = chunk.toString(encoding);
            pattern = new RegExp(replace.match, 'g')
            text = text.replace(pattern, process.env[replace.env]);
            chunk = Buffer.from(text);
          }
        }
        callback(null, chunk);
      }
    });
  }
  cpx.copy(from, to, opts, () => copyAsync(cmdlist));
}

copyAsync(libsdata);

/*
libsdata.forEach((cmd) => {
  let replaceInfo = '';
  if(cmd.replace) {
    replaceInfo = '(REPLACE)';
  }
  console.log(`  ${cmd.from} -> ${cmd.to} ${replaceInfo}`);
  let from = path.resolve(__dirname + "/../" + cmd.from);
  let to = path.resolve(__dirname + "/../" + cmd.to);
  let ops = {};

  if(cmd.replace) {
    ops.transform = (filename) => {
      console.log(filename);
    }
  }

  cpx.copySync(from, to, ops);
});
*/




console.log("Done");
