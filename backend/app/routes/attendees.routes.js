const attendees = require('../controllers/attendees.controller');
const authentication = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/events/:id/attendees')
        .get(authentication.checkTokenNotRequired, attendees.viewAttendees)
        .post(authentication.checkTokenRequired, attendees.addAttendee)
        .delete(authentication.checkTokenRequired, attendees.removeAttendee);

    app.route(app.rootUrl + '/events/:eventId/attendees/:userId')
        .patch(authentication.checkTokenRequired, attendees.changeStatus);

};
