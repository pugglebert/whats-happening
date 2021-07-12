const users = require('../controllers/users.controller');
const authentication = require('../middleware/authenticate');

module.exports = function (app) {

    app.route(app.rootUrl + '/users/register')
        .post(users.addUser);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(authentication.checkTokenRequired, users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(authentication.checkTokenNotRequired, users.getUserInfo)
        .patch(authentication.checkTokenRequired, users.changeDetail);

};