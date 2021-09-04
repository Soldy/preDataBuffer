/*
 *  @Soldy\preDataBuffer\2021.01.16\GPL3
 */
'use strict';
const confrc = require('confrc').base;
const logrc = (require('logrc')).dated(
    confrc.get('output').path,
    confrc.get('output').file
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

