const moment = require('moment-timezone');
const { Op } = require("sequelize");
const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

function currentDateForDB() {
    return moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
}

function currentDate() {
    return moment().tz(TIMEZONE).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
}

const startOfDay = (date) => {
    return moment.tz(date, TIMEZONE).startOf("day");
};
const endOfDay = (date) => {
    return moment.tz(date, TIMEZONE).endOf("day");
};

const getPresetDateRange = (filter) => {
    const now = moment.tz(TIMEZONE);

    if (filter === "this_week") {
        return {
            fromDate: startOfDay(now.clone().startOf("week")),
            toDate: endOfDay(now.clone().endOf("week")),
        };
    }
    if (filter === "previous_week") {
        return {
            fromDate: startOfDay(
                now.clone().subtract(1, "week").startOf("week")
            ),
            toDate: endOfDay(
                now.clone().subtract(1, "week").endOf("week")
            ),
        };
    }
    if (filter === "this_month") {
        return {
            fromDate: startOfDay(now.clone().startOf("month")),
            toDate: endOfDay(now.clone().endOf("month")),
        };
    }
    if (filter === "previous_month") {
        return {
            fromDate: startOfDay(
                now.clone().subtract(1, "month").startOf("month")
            ),
            toDate: endOfDay(
                now.clone().subtract(1, "month").endOf("month")
            ),
        };
    }
    if (filter === "this_year") {
        return {
            fromDate: startOfDay(now.clone().startOf("year")),
            toDate: endOfDay(now.clone().endOf("year")),
        };
    }
    if (filter === "previous_year") {
        return {
            fromDate: startOfDay(
                now.clone().subtract(1, "year").startOf("year")
            ),
            toDate: endOfDay(
                now.clone().subtract(1, "year").endOf("year")
            ),
        };
    }
}
module.exports = { currentDateForDB, currentDate, getPresetDateRange, startOfDay, endOfDay, Op };