/*
 *  @Soldy\preDataBuffer\2021.01.16\GPL3
 */
'use strict';
const confrc = require('confrc').confrc;
const logrc = new (require('logrc')).logBase(
    confrc.get('output').path+'/'+
    Math.round(Date.now()/1000).toString()+
    '.jlog'
);
const src = new (require('statusrc')).statusrc;
const http = require('http');

/*
 * @prototype
 */
const serverBase = function(){
    /*
     *  @private
     *  @return {integer}
     */
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
                    return src.badRequest(res);
                }
                if(req.url === '/')
                    return src.notExist(res);
                if(req.method !== 'POST')
                    return src.notAllowedMethod(res);
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
                return src.ok(res);
            });
        }).listen(
            confrc.get('httpd').port,
            confrc.get('httpd').address
        );
    };
    // constructor
    start();
};

(new serverBase());

