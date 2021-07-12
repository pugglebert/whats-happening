const db = require('../../config/db');
const authentication = require('../middleware/authenticate');

const emailRegex = new RegExp('.+@.+\..+');
const selectUserByEmail = 'SELECT COUNT(1) FROM user WHERE email = ?;';

exports.validateUser = async function( userJson ) {
    const firstName = userJson['firstName'];
    const lastName = userJson['lastName'];
    const email = userJson['email'];
    const password = userJson['password'];

    checkStringNullNotAllowed(firstName, 'firstName');
    checkStringNullNotAllowed(lastName, 'lastName');
    checkStringNullNotAllowed(email, 'email');
    checkStringNullNotAllowed(password, 'password');

    if (!emailRegex.test(email)) {
        throw 'Email format is invalid';
    }

    const [ result ] = await db.getPool().query(selectUserByEmail, email);

    if (result[0]['COUNT(1)'] !== 0) {
        throw 'Email already in use';
    }
};

exports.validateLogin = async function( loginJson ) {
    const email = loginJson['email'];
    const password = loginJson['password'];
    checkStringNullNotAllowed(email, 'email');
    checkStringNullNotAllowed(password, 'password');
    if (!emailRegex.test(email)) {
        throw 'Email format is invalid';
    }
    const [ result1 ] = await db.getPool().query(selectUserByEmail, email);
    if (result1[0]['COUNT(1)'] === 0) {
        throw 'Email not registered';
    }
    const hashedPassword = authentication.hashPassword( password );
    const passwordQuery = 'SELECT password, id FROM user WHERE email = ?;';
    const [ result2 ] = await db.getPool().query( passwordQuery, email );
    if ((result2[0] == null) || result2[0]['password'] !== hashedPassword) {
        throw 'Incorrect password';
    }
};

exports.validateAuthToken = function( authToken ) {
    checkStringNullNotAllowed(authToken, 'authentication token');
    if (authToken.length !== 60) {
        throw 'Authentication token not in expected format';
    }
};

exports.validateUpdateUser = async function( userId, userJson ) {
    const firstName = userJson['firstName'];
    const lastName = userJson['lastName'];
    const email = userJson['email'];
    const newPassword = userJson['password'];
    const currentPassword = userJson['currentPassword'];

    checkStringNullAllowed(firstName, 'firstName');
    checkStringNullAllowed(lastName, 'lastName');
    checkStringNullAllowed(email, 'email');
    checkStringNullAllowed(newPassword, 'newPassword');
    checkStringNullAllowed(currentPassword, 'currentPassword');
    if (firstName == null && lastName == null && email == null && newPassword == null) {
        throw 'You must provide some details to update';
    }
    if (email != null && !emailRegex.test(email)) {
        throw 'Email format is invalid';
    }
    if (newPassword != null) {
        if (currentPassword == null) {
            throw 'Current password must be provided when updating password';
        } else {
            const hashedPassword = authentication.hashPassword( currentPassword );
            const passwordQuery = `SELECT password FROM user WHERE id = '${userId}';`;
            const [ result ] = await db.getPool().query(passwordQuery);
            if ((result[0] == null) || result[0]['password'] !== hashedPassword) {
                throw 'Password given is incorrect';
            }
        }
    }
};

exports.checkUserExists = async function( userId ) {
    const [ result ] = await db.getPool().query(`SELECT COUNT(1) FROM user WHERE id = ${userId}`);
    return result[0]['COUNT(1)'] === 1;
};

exports.validateEventSearch = async function( searchParams ) {
    const q = searchParams['q'];
    const categoryIds = searchParams['categoryIds'];
    const organizerId = searchParams['organizerId'];
    const sortBy = searchParams['sortBy'];
    const count = searchParams['count'];
    const startIndex = searchParams['startIndex'];

    checkStringNullAllowed(q, 'q');
    await checkCategoryIds(categoryIds);
    checkIntegerNullAllowed(organizerId, 'organizerId');
    checkIntegerNullAllowed(count, 'count');
    checkIntegerNullAllowed(startIndex, 'startIndex');

    const sortByOptions = ['DATE_ASC', 'DATE_DESC', 'ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'ATTENDEES_ASC',
        'ATTENDEES_DESC', 'CAPACITY_ASC', 'CAPACITY_DESC'];
    if (sortBy != null && !sortByOptions.includes(sortBy)) {
        throw `Invalid value for sortBy ${sortBy}`;
    }
};

exports.validateEvent = async function( eventJson ) {
    const title = eventJson['title'];
    const description = eventJson['description'];
    const categoryIds = eventJson['categoryIds'];
    const date = eventJson['date'];
    const isOnline = eventJson['isOnline'];
    const capacity = eventJson['capacity'];
    const requiresAttendanceControl = eventJson['requiresAttendanceControl'];
    const fee = eventJson['fee'];

    checkStringNullNotAllowed(title, 'title');
    checkStringNullNotAllowed(description, 'description');
    if (categoryIds === undefined) {
        throw 'Required property categoryIds is not present';
    }
    await checkCategoryIds(categoryIds);
    await checkDateNotInPast(date);
    if (isOnline !== undefined && typeof(isOnline) !== 'boolean') {
        throw 'isOnline must be a boolean';
    }
    if (capacity !== undefined && (typeof(capacity) !== 'number' || !(Number.isInteger(capacity)) || capacity < 1)) {
        throw 'capacity must be a positive integer';
    }
    if (requiresAttendanceControl !== undefined && typeof(requiresAttendanceControl) !== 'boolean') {
        throw 'requiresAttendanceControl must be a boolean';
    }
    if (fee !== undefined && typeof(fee) !== 'number') {
        throw 'fee must be a number';
    }
};

exports.validateEventId = async function ( id ) {
    checkIntegerNullNotAllowed( id , 'eventId');
    const [ event ] = await db.getPool().query(`SELECT 1 FROM event WHERE id = ${id}`);
    if (event.length === 0) {
        throw `No event with id ${id}`;
    }
};

exports.validateUserId = async function ( id ) {
    checkIntegerNullNotAllowed( id, 'userId' );
    const [ user ] = await db.getPool().query(`SELECT 1 FROM user WHERE id = ${id}`);
    if (user.length === 0) {
        throw `No user with id ${id}`;
    }
};

exports.validateAttendeeId = async function ( eventId, userId ) {
    checkIntegerNullNotAllowed( userId, 'userId');
    const [ attendee ] = await db.getPool().query(`SELECT 1 from event_attendees WHERE event_id = ${eventId} AND user_id = ${userId};`);
    if (attendee.length === 0) {
        throw `Event ${eventId} has no attendee with id ${userId}`;
    }
};

exports.validateUpdateEvent = async function ( eventId, patchJson ) {
    const title = patchJson['title'];
    const description = patchJson['description'];
    const categoryIds = patchJson['categoryIds'];
    const date = patchJson['date'];
    const isOnline = patchJson['isOnline'];
    const url = patchJson['url'];
    const venue = patchJson['venue']
    const capacity = patchJson['capacity'];
    const requiresAttendanceControl = patchJson['requiresAttendanceControl'];
    const fee = patchJson['fee'];

    if (title === undefined && description === undefined && categoryIds === undefined && date === undefined &&
        isOnline === undefined && url === undefined  && venue === undefined  && capacity === undefined  &&
        requiresAttendanceControl === undefined  && fee === undefined ) {
        throw 'No valid fields provided';
    }
    checkStringNullAllowed( title );
    checkStringNullAllowed( description );
    if (categoryIds !== undefined) {
        await checkCategoryIds(categoryIds);
    }
    if (date !== undefined) {
        await checkDateNotInPast(date);
    }
    if (isOnline !== undefined && typeof(isOnline) !== 'boolean') {
        throw 'isOnline must be a boolean';
    }
    if (capacity !== undefined && (typeof(capacity) !== 'number' || !(Number.isInteger(capacity)) || capacity < 1)) {
        throw 'capacity must be a positive integer';
    }
    if (requiresAttendanceControl !== undefined && typeof(requiresAttendanceControl) !== 'boolean') {
        throw 'requiresAttendanceControl must be a boolean';
    }
    if (fee !== undefined && typeof(fee) !== 'number') {
        throw 'fee must be a number';
    }
};

exports.validateUpdateAttendee = function ( statusJson ) {
    const status = statusJson['status'];
    checkStringNullNotAllowed(status, 'status');
    const statusOptions = ['accepted', 'rejected', 'pending'];
    if (!statusOptions.includes(status)) {
        throw 'Status must be on of: "accepted", "rejected", "pending"';
    }
};

exports.validateOrganizerId = async function ( eventId, userId ) {
    const [ result ] = await db.getPool().query(`SELECT COUNT(1) FROM event WHERE id = ${eventId} AND organizer_id = ${userId}`);
    if (result[0]['COUNT(1)'] === 0) {
        throw 'Only the organizer of the event can perform this action';
    }
};

exports.checkUserCanJoin = async function ( eventId, userId ) {
    const [ attendeeResult ] = await db.getPool().query(`SELECT COUNT(1) from event_attendees WHERE event_id = ${eventId} AND user_id = ${userId};`);
    if (attendeeResult[0]['COUNT(1)'] === 1) {
        throw `User ${userId} has already joined event ${eventId}`;
    }
    const [ dateResult ] = await db.getPool().query(`SELECT date FROM event WHERE id = ${eventId};`);
    await checkDateNotInPast( dateResult[0]['date'] );
};

exports.checkUserCanLeave = async function ( eventId, userId ) {
    try {
        const [result] = await db.getPool().query(`SELECT attendance_status.name AS status, event.date\n` +
            `FROM event_attendees\n` +
            `INNER JOIN attendance_status ON attendance_status.id = event_attendees.attendance_status_id\n` +
            `INNER JOIN event ON event.id = event_attendees.event_id\n` +
            `WHERE event.id = ${eventId} AND event_attendees.user_id = ${userId};`);
        if (result.length === 0) {
            throw `User ${userId} has not joined event ${eventId}`;
        }
        if (result[0]['status'] === 'rejected') {
            throw `Cannot leave event where status is rejected`;
        }
        await checkDateNotInPast(result[0]['date']);
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.validateImageHeaders = function( headers ) {
    const contentType = headers['content-type'];
    const contentTypeOptions = ['image/jpeg', 'image/png', 'image/gif'];
    if (!contentTypeOptions.includes(contentType)) {
        throw `Invalid content type ${contentType}`;
    }
};

exports.validateUserImageExists = async function( id ) {
    const imageQuery = `SELECT image_filename FROM user WHERE id = ${id}`;
    const [ result ] = await db.getPool().query( imageQuery );
    const filename = result[0]['image_filename'];
    if (filename === null) {
        throw `No image set for user ${id}`;
    }
};

exports.validateEventImageExists = async function( id ) {
    const imageQuery = `SELECT image_filename FROM event WHERE id = ${id}`;
    const [ result ] = await db.getPool().query( imageQuery );
    const filename = result[0]['image_filename'];
    if (filename === null) {
        throw `No image set for event ${id}`;
    }
};

checkDateNotInPast = async function ( date ) {
    checkStringNullNotAllowed(date, 'date');
    const [ result ] = await db.getPool().query('SELECT NOW() AS today;');
    const givenDate = Date.parse(date);
    const todaysDate = Date.parse(result[0]['today']);
    if (givenDate < todaysDate) {
        throw 'Date cannot be in the past';
    }
};

checkCategoryIds = async function (categoryIds) {
    const invalidCategories = [];
    if (categoryIds !== undefined) {
        try {
            let i;
            const categoryIdArray = categoryIds.toString().split(',');
            for (i = 0; i < categoryIdArray.length; i++) {
                checkIntegerNullNotAllowed(categoryIdArray[i], 'categoryIds[' + i + ']');
                const categorySql = `SELECT COUNT(1) AS is_present FROM category WHERE id = ${categoryIdArray[i]};`;
                const [ category ] = await db.getPool().query(categorySql);
                console.log(category[0]['is_present']);
                console.log(1);
                if (category[0]['is_present'] == 0) {
                    invalidCategories.push(categoryIds[i]);
                }
            }

        } catch ( err ) {
            console.log( err );
            throw err;
        }
    }
    if (invalidCategories.length !== 0) {
        throw `Your search contains the following invalid category ids: ${invalidCategories}`;
    }

};

checkIntegerNullAllowed = function( value, fieldName ) {
    if (value != null && /^\d+$/.test(value) === false ) {
        throw `${fieldName} should be integer`;
    }
};

checkIntegerNullNotAllowed = function( value, fieldName ) {
    if (value == null) {
        throw `Required property ${fieldName} is not present`;
    }
    if (/^\d+$/.test(value) === false ) {
        throw `${fieldName} should be integer`;
    }
};

checkStringNullAllowed = function( value, fieldName ) {
    if (value != null && !/\S/.test(value) ) {
        throw `${fieldName} should NOT be shorter than 1 characters`;
    }
};

checkStringNullNotAllowed = function( value, fieldName ) {
    if (value == null) {
        throw `Required property ${fieldName} is not present`;
    }
    if (!/\S/.test(value))  {
        throw `${fieldName} should NOT be shorter then 1 characters`;
    }
};