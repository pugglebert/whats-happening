const db = require('../../config/db');
const authentication = require('../middleware/authenticate');

exports.addUser = async function ( userJson ) {
    const firstName = userJson['firstName'];
    const lastName = userJson['lastName'];
    const email = userJson['email'];
    const password = userJson['password'];
    try {
        const hashedPassword = authentication.hashPassword(password);
        const insertStatement = 'INSERT INTO \`user\`(\`email\`, \`first_name\`, \`last_name\`, \`password\`) VALUES' +
            '( ?, ?, ?, ?);';
        await db.getPool().query( insertStatement, [email, firstName, lastName, hashedPassword] );
        const [ result ] = await db.getPool().query('SELECT LAST_INSERT_ID() AS userId;');
        return result[0];
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.login = async function ( loginJson ) {
    try {
        const email = loginJson['email'];
        const authToken = authentication.generateToken();
        const authTokenUpdate = 'UPDATE user SET auth_token = ? WHERE email = ?;';
        await db.getPool().query( authTokenUpdate, [authToken, email] );
        const [ user ] = await db.getPool().query( 'SELECT id FROM user WHERE email = ?', email );
        const userId = user[0]['id'];
        const json = {
            userId: userId,
            token: authToken
        };
        return json;
    } catch ( err ) {
        console.log( err );
        throw err;
    }

};

exports.logout = async function( userId ) {
    try {
        await db.getPool().query( 'UPDATE user SET auth_token = NULL WHERE id = ?;', userId );
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.getUserInfoSelf = async function ( userId ) {
    try {
        const getUserQuery = 'SELECT first_name AS firstName, last_name AS lastName, email FROM user WHERE id = ?;';
        const [ result ] = await db.getPool().query( getUserQuery, userId );
        return result[0];
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.getUserInfoOther = async function ( userId ) {
    try {
        const getUserQuery = 'SELECT first_name AS firstName, last_name AS lastName FROM user WHERE id = ?;';
        const [ result ] = await db.getPool().query( getUserQuery, userId );
        return result[0];
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.update = async function ( userId, userJson ) {
    const firstName = userJson['firstName'];
    const lastName = userJson['lastName'];
    const email = userJson['email'];
    const password = userJson['password'];
    try {
        const updateList = [];
        if (firstName != null) {
            updateList.push(`first_name = '${firstName}'`);
        }
        if (lastName != null) {
            updateList.push(`last_name = '${lastName}'`);
        }
        if (email != null) {
            updateList.push(`email = '${email}'`)
        }
        if (password != null) {
            const hashedPassword = authentication.hashPassword(password);
            updateList.push(`password = '${hashedPassword}'`);
        }
        const updateClause = 'UPDATE user\n';
        const setClause = 'SET ' + updateList.join(', ') + '\n';
        const whereClause = `WHERE id = ${userId};`;
        console.log(updateClause + setClause + whereClause);
        await db.getPool().query(updateClause + setClause + whereClause);
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};