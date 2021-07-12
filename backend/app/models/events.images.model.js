const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const imageFilePath = '/../../storage/images/';

exports.viewImage = async function ( id ) {
    const imageQuery = `SELECT image_filename FROM event WHERE id = ${id}`;
    const [ result ] = await db.getPool().query( imageQuery );
    const filename = result[0]['image_filename'];
    if (filename === null) {
        return null;
    }
    return path.resolve(__dirname + imageFilePath + filename);
};

exports.setImage = async function ( id, body, contentType ) {
    const selectSql = `SELECT image_filename FROM event WHERE id = ?`;
    const [ result ] = await db.getPool().query( selectSql, id );

    let responseCode;
    const oldFilename = result[0]['image_filename'];
    if (oldFilename === null) {
        responseCode = 201;
    } else {
        responseCode = 200;
        try {
            fs.unlinkSync(path.resolve(__dirname + imageFilePath + oldFilename));
        } catch ( err ) {
            console.log( err );
        }
    }

    let fileExtension = contentType.split('/')[1];
    if (fileExtension === 'jpeg') fileExtension = 'jpg';
    const newFilename = `event_${id}.${fileExtension}`;

    fs.writeFileSync(path.resolve(__dirname + imageFilePath + newFilename), body);
    const updateSql = 'UPDATE event SET image_filename = ? WHERE id = ?';
    await db.getPool().query(updateSql, [newFilename, id]);
    return responseCode;
};