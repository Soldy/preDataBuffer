'use strict';
const confrc = new (require('confrc')).confrc();
const logrc = new (require('logrc')).logBase(
    confrc.get('output').path+'/'+
    Math.round(Date.now()/1000).toString()+
    '.jlog'
);
const http = require('http');


const serverBase = function(){
    const start=function(){
        http.createServer(function (req, res) {
            let post = '';
            req.on('data', function (chunk) {
                post += chunk;
            });
            req.on('end', async function () {
                try{
                    post = JSON.parse(post);
                }catch(e){
                    return badRequest(res);
                }
                if(req.url === '/')
                    return res.end();
                if(req.method !== 'POST')
                    return notAllowedMethod(res);
                const finnalData = (Buffer.from(JSON.stringify(
                    post
                ))).toString('base64');
                const remote  = req.connection.remoteAddress;
                const headers = req.rawHeaders;
                logrc.log({
                    name      : req.url,
                    data      : finnalData,
                    size      : finnalData.length
                });
                return end(res);
            });
        }).listen(
            confrc.get('httpd').port,
            confrc.get('httpd').address
        );
    };
    const end = function(res){
        res.writeHead(200);
        res.write(
            JSON.stringify({
                'result':'ok'
            })
        );
        return res.end();

    };
    const notAllowedMethod = function(res){
        res.writeHead(405);
        res.write(
            JSON.stringify({
                'result':'Method Not Allowed'
            })
        );
        return res.end();
    };
    const badRequest = function(res){
        res.writeHead(400);
        res.write(
            JSON.stringify({
                'result':'bad request'
            })
        );
        return res.end();
    };
    const stop=function(){ 
        http.close();
    };
    process.on('EXIT', stop);
    process.on('SIGINT', stop);
    start();
};

(new serverBase());

