const userImages = require('../controllers/users.images.controller');
const authentication = require('../middleware/authenticate');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/image')
        .get(userImages.viewImage)
        .put(authentication.checkTokenRequired, userImages.setImage)
        .delete(authentication.checkTokenRequired, userImages.removeImage);
};
