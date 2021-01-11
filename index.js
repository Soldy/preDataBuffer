"use strict"
const confrc = new (require('confrc')).confrc();
const logrc = new (require('logrc')).logBase(
    confrc.get("output").path+'/'+
    Math.round(Date.now()/1000).toString()+
    '.jlog'
);
const initrc = new (require('initrc')).init();
const ic = (require('interactiveConsole')).console;
const http = require('http');


const serverBase = function(){
    const start=function(){
        http.createServer(function (req, res) {
            let post = "";
            req.on('data', function (chunk) {
                post += chunk;
             });
             req.on('end', async function () {
                 try{
                     post = JSON.parse(post);
                 }catch(e){
                     return res.end();
                 }
                 if(req.url === '/')
                     return res.end();
                 if(req.method !== 'POST')
                     return res.end();
                 const finnalData = (Buffer.from(JSON.stringify(
                     post
                 ))).toString('base64')
                 logrc.log({
                     name      : req.url,
                     remote    : req.connection.remoteAddress,
                     headers   : req.rawHeaders,
                     data      : finnalData,
                     size      : finnalData.length
                 });
                 return res.end();
            });
        }).listen(
            confrc.get("httpd").port,
            confrc.get("httpd").address
        );
    }
    const stop=function(){ 
        http.close();
    }
    process.on('EXIT', stop);
    process.on('SIGINT', stop);
    start();
}

const serv = new serverBase();

