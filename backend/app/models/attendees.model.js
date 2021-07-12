const db = require('../../config/db');

exports.viewAttendees = async function ( eventId, authenticatedUserId ) {
    const organizerIdQuery = 'SELECT organizer_id FROM event WHERE id = ?';
    const [ organizerResult ] = await db.getPool().query( organizerIdQuery, eventId );
    const organizerId = organizerResult[0]['organizer_id'];
    const selectClause = 'SELECT user.id AS attendeeId, user.first_name AS firstName, user.last_name AS lastName, ' +
        'attendance_status.name AS status, date_of_interest as dateOfInterest\n';
    const fromClause = 'FROM event_attendees\n' +
        'INNER JOIN attendance_status ON event_attendees.attendance_status_id = attendance_status.id\n' +
        'INNER JOIN user ON user.id = event_attendees.user_id\n';
    let whereClause;
    if (organizerId === authenticatedUserId) {
        whereClause = 'WHERE event_attendees.event_id = ?\n';
    } else if (authenticatedUserId === undefined) {
        whereClause = 'WHERE event_attendees.event_id = ? AND attendance_status.name = \'accepted\'\n';
    } else {
        whereClause = 'WHERE event_attendees.event_id = ?\n' +
            'AND (attendance_status.name = \'accepted\' OR user.id = ?)\n';
    }
    const orderByClause = 'ORDER BY date_of_interest ASC;';
    const [ attendeeResult ] = await db.getPool().query( selectClause + fromClause + whereClause + orderByClause, [eventId, authenticatedUserId]);
    return attendeeResult;
};

exports.addAttendee = async function ( eventId, userId ) {
    let initialStatus = 'accepted';
    const [ attendanceControlResult ] = await db.getPool().query('SELECT requires_attendance_control FROM event WHERE id = ?;', eventId);
    if (attendanceControlResult[0]['requires_attendance_control'] === 1) {
        initialStatus = 'pending';
    }
    const insertSql = 'INSERT INTO \`event_attendees\` (\`event_id\`, \`user_id\`, \`attendance_status_id\`, \`date_of_interest\`)\n' +
        'VALUES (?, ?, (SELECT id FROM attendance_status WHERE name = ?), (SELECT NOW()));';
    await db.getPool().query(insertSql, [eventId, userId, initialStatus]);
};

exports.removeAttendee = async function ( eventId, userId ) {
    const removeSql = 'DELETE FROM \`event_attendees\` WHERE event_id = ? AND user_id = ?;';
    await db.getPool().query(removeSql, [eventId, userId]);
};

exports.changeStatus = async function ( eventId, userId, statusJson ) {
    const status = statusJson['status'];
    const updateSql = 'UPDATE event_attendees\n' +
        'SET attendance_status_id = (SELECT id FROM attendance_status WHERE name = ?)\n' +
        'WHERE event_id = ? AND user_id = ?;';
    await db.getPool().query(updateSql, [status, eventId, userId]);
};