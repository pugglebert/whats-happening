const Users = require('../models/users.model');
const Validation = require('../middleware/validate');
const Authentication = require('../middleware/authenticate');

exports.addUser = async function (req, res) {
    try {
        await Validation.validateUser( req.body );
    } catch ( err ) {
        res.statusMessage = `Bad request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        const newUser = await Users.addUser(req.body);
        res.status( 201 )
            .send(newUser);
    } catch ( err ) {
        res.statusMessage = `Error registering user ${err}.`;
        res.status( 500 )
            .send();
    }
};

exports.login = async function (req, res) {
    try {
        await Validation.validateLogin( req.body );
    } catch ( err ) {
        res.statusMessage = `Bad request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        const responseBody = await Users.login( req.body );
        res.status( 200 )
            .send( responseBody );
    } catch ( err ) {
        res.statusMessage = `Error logging in ${err}`;
        res.status ( 500 )
            .send();
    }

};

exports.logout = async function (req, res) {
    const userId = req.authenticatedUserId;
    try {
        await Users.logout( userId );
        res.status( 200 )
            .send();
    } catch ( err ) {
        res.statusMessage = `Error logging out: ${err}`;
        res.status( 500 )
            .send();
    }
};

exports.getUserInfo = async function (req, res) {
    const userId = req.authenticatedUserId;
    let userInfo;
    try {
        await Validation.validateUserId( req.params['id'] );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    try {
        if (userId != null && userId.toString() === req.params['id']) {
            userInfo = await Users.getUserInfoSelf( req.params['id'] );
        } else {
            userInfo = await Users.getUserInfoOther( req.params['id']);
        }
        res.status( 200 )
            .send(userInfo);
    } catch ( err ) {
        res.statusMessage = ` Error getting user info: ${err}`;
        res.status( 500 )
            .send();
    }


};

exports.changeDetail = async function (req, res) {
    const authenticatedUser = req.authenticatedUserId.toString();
    const userToChange = req.params['id'];
    try {
        await Validation.validateUserId( userToChange );
    } catch ( err ) {
        res.statusMessage = `Not Found: ${err}`;
        res.status( 404 )
            .send();
        return;
    }
    if (authenticatedUser !== userToChange) {
        res.statusMessage = 'Forbidden: Cannot change another user\'s details';
        res.status(403)
            .send();
        return;
    }
    try {
        await Validation.validateUpdateUser(userToChange, req.body);
    } catch ( err ) {
        res.statusMessage = `Bad request: ${err}`;
        res.status( 400 )
            .send();
        return;
    }
    try {
        await Users.update(userToChange, req.body);
        res.status( 200 )
            .send();
    } catch ( err ) {
        res.statusMessage = `Error updating user ${err}`;
        res.status( 500 )
            .send();
    }
};