const events = require('../controllers/events.controller');
const authentication = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.viewEvents);

    app.route(app.rootUrl + '/events')
        .post(authentication.checkTokenRequired, events.addEvent);

    app.route(app.rootUrl + '/events/categories')
        .get(events.viewCategories);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getDetailed)
        .patch(authentication.checkTokenRequired, events.changeDetail)
        .delete(authentication.checkTokenRequired, events.deleteEvent);

};
