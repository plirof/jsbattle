#!/usr/bin/env node
'use strict'

const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');

showdown.setFlavor('github');
showdown.setOption('tables', true);
showdown.setOption('disableForced4SpacesIndentedSublists', true);
const converter = new showdown.Converter();

function mkdir(name) {
  let p = path.resolve(__dirname + "/../" + name);
  if(fs.existsSync(p)) {
    return;
  }
  fs.mkdirSync(p, {recursive: true});
}

function processMd(txt) {
  txt = txt.replace(/(\[[^\]]*\]\([^\)]*\.)md\)/gi, '$1html)');
  return txt;
}

function processHtml(txt, level, sidebarContent) {
  sidebarContent = sidebarContent.replace(/(\[[^\]]*\]\()([^\)]*\.)md\)/gi, '$1' + ('../'.repeat(level)) + '$2html)');
  let htmlContent = converter.makeHtml(sidebarContent);
  let css = '../'.repeat(level) +  'style.css';
  txt = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>JsBattle Docs</title>
    <link rel="stylesheet" href="${css}" type="text/css">
  </head>
  <body>
    <div id="side">
      ${htmlContent}
    </div>
    <div id="main">
      ${txt}
    </div>
  </body>
</html>`;
  return txt;
}

function processPath(base, sub, sidebarContent, level) {
  level = level || 0;
  let basePath = path.resolve(__dirname + "/../" + base);
  let currentPath = path.resolve(basePath + "/" + sub);
  let content = fs.readdirSync(currentPath);
  content.forEach((filename) => {
    let subpath = path.resolve(currentPath + "/" + filename)
    let stat = fs.statSync(subpath);
    if(stat.isDirectory()) {
      mkdir('dist' + sub + '/' + filename);
      processPath(base, sub + '/' + filename, sidebarContent, level+1);
    } else if(filename.substring(filename.length-3) == '.md') {
      let mdPath = subpath;
      let htmlPath = path.resolve(__dirname + "/../dist/" + sub + '/' + filename.substring(0, filename.length-3) + ".html");
      let mdContent = fs.readFileSync(mdPath).toString();
      mdContent = processMd(mdContent);
      let htmlContent = converter.makeHtml(mdContent);
      htmlContent = processHtml(htmlContent, level, sidebarContent);
      console.log(htmlPath);
      fs.writeFileSync(htmlPath, htmlContent);
    }
  })
}

mkdir('dist');
let sidebar = fs.readFileSync(path.resolve(__dirname + "/../docs/_sidebar.md")).toString();
processPath('docs', "", sidebar);

let indexContent = fs.readFileSync(path.resolve(__dirname + '/../dist/README.html')).toString();
fs.writeFileSync(path.resolve(__dirname + '/../dist/index.html'), indexContent);
