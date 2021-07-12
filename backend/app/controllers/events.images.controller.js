const EventImages = require('../models/events.images.model');
const Validation = require('../middleware/validate');

exports.viewImage = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['id'] );
        await Validation.validateEventImageExists( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        const filepath = await EventImages.viewImage( req.params['id'] );
        if (filepath === null) {
            res.statusMessage = `Not Found: There is no image for user ${req.params['id']}`;
            res.status( 404 )
                .send();
            return;
        }
        res.status( 200 )
            .sendFile( filepath );
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error retrieving event image ${err}`;
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
        await Validation.validateEventId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        await Validation.validateOrganizerId( req.params['id'], req.authenticatedUserId );
    } catch ( err ) {
        res.statusMessage = `Forbidden: ${err}`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        const responseCode = await EventImages.setImage( req.params['id'], req.body, req.headers['content-type'] );
        res.status( responseCode )
            .send();
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error setting event image ${err}`;
        res.status( 500 )
            .send();
    }
};