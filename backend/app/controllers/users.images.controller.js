const UserImages = require('../models/users.images.model');
const Validation = require('../middleware/validate');

exports.viewImage = async function ( req, res ) {
    try {
        await Validation.validateUserId( req.params['id'] );
        await Validation.validateUserImageExists( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        const filepath = await UserImages.viewImage( req.params['id'] );
        if (filepath === null) {
            res.statusMessage = `There is no image for user ${req.params['id']}`;
            res.status( 404 )
                .send();
            return;
        }
        res.status( 200 )
            .sendFile( filepath );
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error retrieving user image: ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.setImage = async function ( req, res ) {
    try {
        Validation.validateImageHeaders( req.headers );
    } catch ( err ) {
        res.statusMessage = `Bad Request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        await Validation.validateUserId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    if (req.params['id'] !== req.authenticatedUserId.toString()) {
        res.statusMessage = `Forbidden: You cannot change another user's profile picutre`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        const responseCode = await UserImages.setImage( req.params['id'], req.body, req.headers['content-type'] );
        res.status( responseCode )
            .send();
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error setting user image: ${err}`;
        res.status( 500 )
            .send();
    }
}

exports.removeImage = async function(req, res) {
    try {
        await Validation.validateUserId( req.params['id'] );
        await Validation.validateUserImageExists( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    if (req.params['id'] !== req.authenticatedUserId.toString()) {
        res.statusMessage = `Forbidden: You cannot remove another user's profile picture`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        await UserImages.removeImage( req.params['id'] );
        res.status( 200 )
            .send();
    } catch ( err ) {
        res.statusMessage = `Error removing user image: ${err}`;
        res.status( 500 )
            .send( err );
    }
}