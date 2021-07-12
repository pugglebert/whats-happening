const db = require('../../config/db');

exports.viewEvents = async function ( searchParams ) {

    const startIndex = searchParams['startIndex'];
    const count = searchParams['count'];
    const q = searchParams['q'];
    const organizerId = searchParams['organizerId'];
    let categoryIds = searchParams['categoryIds'];
    let sortBy = searchParams['sortBy'];
    if (sortBy === undefined) sortBy = 'DATE_DESC';

    try {

        const selectClause = 'SELECT E1.id as eventId, E1.title, E1.capacity,' +
            'U1.first_name AS organizerFirstName, U1.last_name AS organizerLastName, E1.date, ' +
            'GROUP_CONCAT(DISTINCT C1.category_id ORDER BY  C1.category_id ASC) AS categories, ' +
            '(SELECT COUNT(DISTINCT A1.user_id) FROM event_attendees AS A1\n' +
            '   JOIN event AS E2 ON E2.id = A1.event_id\n' +
            '   WHERE E2.id = eventId\n' +
            '   AND A1.attendance_status_id = 1) AS numAcceptedAttendees\n';
        const fromClause = 'FROM event AS E1\n' +
            'LEFT OUTER JOIN event_category AS C1 ON E1.id = C1.event_id\n' +
            'LEFT OUTER JOIN user AS U1 ON E1.organizer_id = U1.id\n';
        const whereList = [];
        if (q != null) {
            whereList.push(`( E1.title LIKE '%${q}%' OR E1.description LIKE '%${q}%' )\n`);
        }
        if (categoryIds != null) {
            if (typeof(categoryIds) == 'string') {
                categoryIds = [categoryIds];
            }
            whereList.push(`EXISTS (SELECT C2.event_id, C2.category_id\n` +
            `   FROM event_category AS C2\n` +
            `   WHERE C2.event_id = E1.id\n` +
            `   AND C2.category_id IN (${categoryIds.join(', ')}))\n`);
        }
        if (organizerId != null) {
            whereList.push(`E1.organizer_id = ${organizerId}\n`);
        }
        let whereClause = '';
        if (whereList.length > 0) {
            whereClause = 'WHERE ' + whereList.join('AND ');
        }


        const sortByDirection = sortBy.split('_')[1];
        let orderByDirection = 'DESC'

        if (sortByDirection === 'ASC') {
            orderByDirection = 'ASC';
        }

        const sortByColumn = sortBy.split('_')[0];
        let orderByColumn;
        switch (sortByColumn) {
            case 'ALPHABETICAL':
                orderByColumn = 'E1.title';
                break;
            case 'ATTENDEES':
                orderByColumn = 'numAcceptedAttendees';
                break;
            case 'CAPACITY':
                orderByColumn = 'E1.capacity';
                break;
            default:
                orderByColumn = 'E1.date';
        }

        const orderByClause = `ORDER BY ${orderByColumn} ${orderByDirection}, E1.id ASC\n`;
        const groupByClause =  'GROUP BY E1.id\n';
        let limitClause = 'LIMIT 18446744073709551610 ';
        if (count != null) {
            limitClause = `LIMIT ${count}`;
        }
        if (startIndex != null) {
            limitClause += ` OFFSET ${startIndex}`;
        }

        const sql = selectClause + fromClause + whereClause + groupByClause + orderByClause + limitClause + ';';
        const [rows] = await db.getPool().query(sql);

        let i;
        for (i = 0; i < rows.length; i++) {
            rows[i]['categories'] = rows[i]['categories'].split(',').map(function(num) {
                return parseInt(num, 10);
            });
            rows[i]['date'] = new Date(rows[i]['date'].getTime() - rows[i]['date'].getTimezoneOffset() * 60000);
        }
        return rows;

    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.addEvent = async function ( eventJson, organizerId ) {
    const title = eventJson['title'];
    const description = eventJson['description'];
    const categoryIds = eventJson['categoryIds'];
    const date = eventJson['date'];
    const isOnline = eventJson['isOnline'];
    const url = eventJson['url'];
    const venue = eventJson['venue'];
    const capacity = eventJson['capacity'];
    const requiresAttendanceControl = eventJson['requiresAttendanceControl'];
    const fee = eventJson['fee'];

    try {
        const isOnlineString = isOnline == null ? '0' : isOnline.toString();
        const urlString = url == null ? 'null' : '\'' + url.toString() + '\'';
        const venueString = venue == null ? 'null' : '\'' + venue.toString() + '\'';
        const capacityString = capacity == null ? 'null' : capacity.toString();
        const requiresAttendanceControlString = requiresAttendanceControl == null ? '0' : requiresAttendanceControl.toString();
        const feeString = fee == null ? '0.00' : fee.toString();
        const eventInsert = `INSERT INTO \`event\`(\`title\`, \`description\`, \`date\`, \`is_online\`, \`url\`, ` +
            `\`venue\`, \`capacity\`, \`requires_attendance_control\`, \`fee\`, \`organizer_id\`) VALUES ( '${title}', '${description}',` +
            `"${date}", ${isOnlineString}, ${urlString}, ${venueString}, ${capacityString}, ${requiresAttendanceControlString}, ${feeString}, ${organizerId} );`
        await db.getPool().query(eventInsert);
        const [ newEvent ] = await db.getPool().query('SELECT LAST_INSERT_ID() AS eventId;');
        let i;
        for (i = 0; i < categoryIds.length; i++) {
            const eventCategoryInsert = `INSERT INTO \`event_category\` (\`event_id\`, \`category_id\`) VALUES (` +
                `${newEvent[0]['eventId']}, ${categoryIds[i]});`
            await db.getPool().query(eventCategoryInsert);
        }
        return newEvent[0];
    } catch ( err ) {
        console.log( err );
        throw err;
    }

};

exports.getDetailed = async function (id) {
    try {
        const selectClause = 'SELECT E1.id as eventId, E1.title, ' +
            'GROUP_CONCAT(DISTINCT C1.category_id ORDER BY  C1.category_id ASC) AS categories, ' +
            'U1.first_name AS organizerFirstName, U1.last_name AS organizerLastName, ' +
            '(SELECT COUNT(DISTINCT A1.user_id) FROM event_attendees AS A1\n' +
            '   JOIN event AS E2 ON E2.id = A1.event_id\n' +
            '   WHERE E2.id = eventId\n' +
            '   AND A1.attendance_status_id = 1) AS attendeeCount, E1.capacity, ' +
            'E1.description, E1.organizer_id as organizerId, E1.date AS date, ' +
            'E1.is_online as isOnline, E1.url, E1.venue, E1.requires_attendance_control as requiresAttendanceControl, E1.fee\n';
        const fromClause = 'FROM event AS E1\n' +
            'LEFT OUTER JOIN event_category AS C1 ON E1.id = C1.event_id\n' +
            'LEFT OUTER JOIN user AS U1 ON E1.organizer_id = U1.id\n';
        const whereClause = `WHERE E1.id = ${id};`;
        const [event] = await db.getPool().query(selectClause + fromClause + whereClause);
        event[0]['categories'] = event[0]['categories'].split(',').map(function(num) {
            return parseInt(num, 10);
        });
        event[0]['date'] = new Date(event[0]['date'].getTime() - event[0]['date'].getTimezoneOffset() * 60000);
        return event[0];
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.changeDetail = async function ( id, patchJson ) {
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
    try {
        const updateClause = 'UPDATE event\n';
        const setList = [];
        if (title != null) {
            setList.push(`title = '${title}'`);
        }
        if (description != null) {
            setList.push(`description = '${description}'`);
        }
        if (date != null) {
            setList.push(`date = "${date}"`);
        }
        if (isOnline != null) {
            setList.push(`is_online = ${isOnline ? 1 : 0}`);
        }
        if (url != null) {
            setList.push(`url = '${url}'`);
        }
        if (venue != null) {
            setList.push(`capacity = ${capacity}`)
        }
        if (requiresAttendanceControl != null) {
            setList.push(`requires_attendance_control = ${requiresAttendanceControl ? 1 : 0}`);
        }
        if (fee != null) {
            setList.push(`fee = ${fee}`);
        }
        let setClause = 'SET ' + setList.join(', ') + '\n';
        const whereClause = `WHERE id = ${id};`;
        await db.getPool().query(updateClause + setClause + whereClause);

        if (categoryIds != null) {
            await db.getPool().query(`DELETE FROM \`event_category\` WHERE event_id = ${id}`);
            let i;
            for (i = 0; i < categoryIds.length; i++) {
                const eventCategoryInsert = `INSERT INTO \`event_category\` (\`event_id\`, \`category_id\`) VALUES (` +
                    `${id}, ${categoryIds[i]});`
                await db.getPool().query(eventCategoryInsert);
            }
        }
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.deleteEvent = async function ( id ) {
    try {
        await db.getPool().query('DELETE FROM `event_attendees` WHERE event_id = ?;', id);
        await db.getPool().query('DELETE FROM `event_category` WHERE event_id = ?;', id);
        await db.getPool().query('DELETE FROM `event` WHERE id = ?;', id);
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};

exports.viewCategories = async function () {
    try {
        const [ categories ] = await db.getPool().query('SELECT * FROM category;');
        return categories;
    } catch ( err ) {
        console.log( err );
        throw err;
    }
};