/**
 * Checks if the restaurant is currently open based on operating mode and schedule.
 * @param {Object} restaurantInfo - Database record containing operating_mode, opening_time, closing_time
 */
const checkIsOpen = (restaurantInfo) => {
    const mode = restaurantInfo?.operating_mode || 'auto';

    // Mode 1: Forced Closed
    if (mode === 'forced_closed') {
        return false;
    }

    // Mode 2: Forced Open
    if (mode === 'forced_open') {
        return true;
    }

    // Mode 3: Auto (Follow Schedule)
    const opening = restaurantInfo?.opening_time || '17:00';
    const closing = restaurantInfo?.closing_time || '23:00';

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinutes;

    const [opHour, opMin] = opening.split(':').map(Number);
    const [clHour, clMin] = closing.split(':').map(Number);
    const openingTimeMinutes = opHour * 60 + opMin;
    const closingTimeMinutes = clHour * 60 + clMin;

    if (closingTimeMinutes > openingTimeMinutes) {
        return currentTimeMinutes >= openingTimeMinutes && currentTimeMinutes < closingTimeMinutes;
    } 
    
    return currentTimeMinutes >= openingTimeMinutes || currentTimeMinutes < closingTimeMinutes;
};

module.exports = { checkIsOpen };
