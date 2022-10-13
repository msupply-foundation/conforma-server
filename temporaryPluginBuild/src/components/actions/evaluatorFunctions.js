"use strict";
/*
Utility functions to extend capabilities of expression evaluator via the
"objectFunctions" operator.

Any changes done here should also be replicated in front-end
"evaluatorFunctions.ts"so they can be simulated in the Template Builder.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const generateExpiry = (duration) => luxon_1.DateTime.now().plus(duration).toJSDate();
// getYear() => "2022"
// getYear("short") => "22"
const getYear = (type) => type === 'short' ? String(new Date().getFullYear()).slice(2) : String(new Date().getFullYear());
// Returns ISO date string or JS Date as formatted Date (Luxon). Returns current
// date if date not supplied
const getFormattedDate = (formatString, inputDate) => {
    const date = inputDate
        ? typeof inputDate === 'string'
            ? luxon_1.DateTime.fromISO(inputDate)
            : luxon_1.DateTime.fromJSDate(inputDate)
        : luxon_1.DateTime.now();
    if (typeof formatString === 'string')
        return date.toFormat(formatString);
    const { format, locale } = formatString;
    return date.toFormat(format, { locale });
};
// Returns JS Date object from ISO date string. Returns current timestamp if
// no parameter supplied
const getJSDate = (date) => (date ? luxon_1.DateTime.fromISO(date).toJSDate() : new Date());
// Returns ISO date-time string from JS Date object. Returns current timestamp
// if no parameter supplied
const getISODate = (date) => date ? luxon_1.DateTime.fromJSDate(date).toISO() : luxon_1.DateTime.now().toISO();
exports.default = { generateExpiry, getYear, getFormattedDate, getJSDate, getISODate };
//# sourceMappingURL=evaluatorFunctions.js.map