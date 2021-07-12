const Attendees = require('../models/attendees.model');
const Validation = require('../middleware/validate');

exports.viewAttendees = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        const result = await Attendees.viewAttendees( req.params['id'], req.authenticatedUserId );
        res.status( 200 )
            .send( result );
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error retrieving attendees: ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.addAttendee = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        await Validation.checkUserCanJoin( req.params['id'], req.authenticatedUserId );
    } catch ( err ) {
        res.statusMessage = `Forbidden: ${err}`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        await Attendees.addAttendee( req.params['id'], req.authenticatedUserId );
        res.status( 201 )
            .send();
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error adding attendee: ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.removeAttendee = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        await Validation.checkUserCanLeave( req.params['id'], req.authenticatedUserId );
    } catch ( err ) {
        res.statusMessage = `Forbidden ${err}`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        await Attendees.removeAttendee( req.params['id'], req.authenticatedUserId );
        res.status( 200 )
            .send();
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error removing attendee: ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.changeStatus = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['eventId'] );
        await Validation.validateAttendeeId( req.params['eventId'], req.params['userId'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        Validation.validateUpdateAttendee( req.body );
    } catch ( err ) {
        res.statusMessage = `Bad Request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        await Validation.validateOrganizerId( req.params['eventId'], req.authenticatedUserId );
    } catch ( err ) {
        res.statusMessage = `Forbidden: ${err}`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        await Attendees.changeStatus( req.params['eventId'], req.params['userId'], req.body );
        res.status( 200 )
            .send();
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error changing attendee status: ${err}`;
        res.status( 500 )
            .send();
    }
};