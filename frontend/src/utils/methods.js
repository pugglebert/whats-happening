export function setCategoryNames(events, categories) {
    for (let event of events) {
        event.categoryNames = [];
        for (let categoryId of event.categories) {
            for (let category of categories) {
                if (category.id === categoryId) {
                    event.categoryNames.push(category.name);
                    break;
                }
            }
        }
    }
    return events;
}

export function setDateTime(events) {
    for (let event of events) {
        const eventDate = new Date(event.date);
        event.dateString = eventDate.toDateString();
        event.timeString = eventDate.toTimeString().substring(0, 5);
    }
    return events;
}