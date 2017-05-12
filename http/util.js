'use strict';

module.exports.createError = (res, text, evt) => {
    console.error({text, evt});
    Object.assign(res, {statusCode: 500});
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({error: text}));
};

module.exports.streamBodyParser = request => {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('data', data => {
            body += data;
        });

        request.on('end', () => resolve(body));
        request.on('error', reject);
        request.on('close', evt => console.warn('WARNING: request closed', evt));
    });
};
