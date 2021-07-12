const db = require('../../config/db');
const path = require('path');
const fs = require('fs')

const imageFilePath = '/../../storage/images/'

exports.viewImage = async function ( id ) {
    const imageQuery = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await db.getPool().query( imageQuery, id );
    const filename = result[0]['image_filename'];
    if (filename === null) {
        return null;
    }
    return path.resolve(__dirname + imageFilePath + filename);
};

exports.setImage = async function ( id, body, contentType ) {
    let responseCode;
    const imageQuery = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await db.getPool().query( imageQuery , id );
    const filename = result[0]['image_filename'];
    if (filename === null) {
        responseCode = 201;
    } else {
        responseCode = 200;
        try {
            fs.unlinkSync(path.resolve(__dirname + imageFilePath + filename));
        } catch ( err ) {
            console.log( err );
        }
    }

    let fileExtension = contentType.split('/')[1];
    if (fileExtension === 'jpeg') fileExtension = 'jpg';
    const newFilename = `user_${id}.${fileExtension}`;

    fs.writeFileSync(path.resolve(__dirname + imageFilePath + newFilename), body);
    const updateSql = `UPDATE user SET image_filename = ? WHERE id = ?`;
    await db.getPool().query(updateSql, [newFilename, id]);
    return responseCode;
};

exports.removeImage = async function ( id ) {
    const imageQuery = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await db.getPool().query( imageQuery , id );
    const filename = result[0]['image_filename'];
    if (filename !== null) {
        fs.unlinkSync(path.resolve(__dirname + imageFilePath + filename));
        await db.getPool().query('UPDATE user SET image_filename = NULL WHERE id = ?', id);
    }
};