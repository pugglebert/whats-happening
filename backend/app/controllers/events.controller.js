const Events = require('../models/events.model');
const Validation = require('../middleware/validate');

exports.viewEvents = async function ( req, res ) {
    try {
        await Validation.validateEventSearch( req.query );
    } catch ( err ) {
        res.statusMessage = `Bad request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        let matchingEvents = await Events.viewEvents( req.query );
        res.status( 200 )
            .send(matchingEvents);
    } catch ( err ) {
        console.log( err );
        res.statusMessage = `Error retrieving events ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.addEvent = async function ( req, res ) {
    try {
        await Validation.validateEvent( req.body );
    } catch ( err ) {
        res.statusMessage = `Bad Request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        const newEvent = await Events.addEvent( req.body, req.authenticatedUserId );
        res.status( 201 )
            .send(newEvent);
    } catch ( err ) {
        res.statusMessage = `Error adding event ${err}`;
        res.status( 500 )
            .send();
    }

};

exports.getDetailed = async function ( req, res ) {
    try {
        await Validation.validateEventId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        const event = await Events.getDetailed( req.params['id'] );
        res.status( 200 )
            .send(event);
    } catch ( err ) {
        res.statusMessage = `Error retrieving event ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.changeDetail = async function ( req, res ) {
    try {
        await Validation.validateEventId(req.params['id']);
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        await Validation.validateOrganizerId( req.params['id'], req.authenticatedUserId);
    } catch ( err ) {
        res.statusMessage = `Forbidden: ${err}`;
        res.status( 403 )
            .send();
        return;
    }
    try {
        await Events.changeDetail( req.params['id'], req.body);
        res.status( 200 )
            .send();
    } catch ( err ) {
        res.statusMessage = `Error updating event ${err}`;
        res.status( 500 )
            .send();

    }

};

exports.deleteEvent = async function ( req, res ) {
    try {
        await Validation.validateEventId ( req.params['id'] );
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
            .send( err );
        return;
    }
    try {
        await Events.deleteEvent( req.params['id'] );
        res.status( 200 )
            .send();
    } catch ( err ) {
        res.statusMessage = `Error deleting event ${err}.`;
        res.status( 500 )
            .send();
    }

};

exports.viewCategories = async function ( req, res ) {
    try {
        const categories = await Events.viewCategories();
        res.status( 200 )
            .send(categories);
    } catch ( err ) {
        res.statusMessage = `Error retrieving category information ${err}.`;
        res.status( 500 )
            .send();
    }
};