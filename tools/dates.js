// Dates for display and structured data. A YAML date without a time
// (date: 2024-12-15) is midnight UTC, so both format in UTC: in local time
// the build machine's time zone could move it to the day before.

const DANISH = new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const asDate = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) throw new Error(`dates: "${d}" is not a date`);
    return date;
};

// 2024-12-15 -> "15. december 2024"
const danishDate = (d) => DANISH.format(asDate(d));

// 2024-12-15 -> "2024-12-15"
const isoDate = (d) => asDate(d).toISOString().slice(0, 10);

module.exports = { danishDate, isoDate };
