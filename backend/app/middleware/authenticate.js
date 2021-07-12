const crypto = require('crypto');
const db = require('../../config/db');

exports.checkTokenRequired = async function ( req, res, next ) {
    const authToken = req.headers['x-authorization'];
    try {
        const user = await getUserIdFromAuthToken( authToken );
        if (user == null) {
            res.statusMessage = 'Unauthorized';
            res.status( 401 )
                .send();
        } else {
            req.authenticatedUserId = user['id'];
            await next();
        }
    } catch ( err ) {
        res.statusMessage = `Error authenticating account ${err}.`;
        res.status( 500 )
            .send();
    }
};

exports.checkTokenNotRequired = async function ( req, res, next ) {
    const authToken = req.headers['x-authorization'];
    try {
        const user = await getUserIdFromAuthToken( authToken );
        if (user != null) {
            req.authenticatedUserId = user['id'];
        }
        await next();
    } catch ( err ) {
        res.statusMessage = `Error authenticating account ${err}.`;
        res.status( 500 )
            .send();
    }
};

getUserIdFromAuthToken = async function ( authToken ) {
    const authTokenQuery = `SELECT id FROM user WHERE auth_token = '${authToken}';`;
    const [ result ] = await db.getPool().query( authTokenQuery );
    return result[0];
};

exports.generateToken = function () {
    return crypto.randomBytes( 30 ).toString( 'hex' );
};

exports.hashPassword = function ( password ) {
    const sha256 = crypto.createHash( 'sha256' );
    return sha256.update( password ).digest( 'base64' );
};