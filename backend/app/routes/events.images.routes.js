const eventImages = require('../controllers/events.images.controller');
const authentication = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/events/:id/image')
        .get(eventImages.viewImage)
        .put(authentication.checkTokenRequired, eventImages.setImage);
};
