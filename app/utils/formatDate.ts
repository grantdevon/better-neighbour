import I18n from "i18n-js"

// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import type { Locale } from "date-fns"
import format from "date-fns/format"
import parseISO from "date-fns/parseISO"
import ar from "date-fns/locale/ar-SA"
import ko from "date-fns/locale/ko"
import en from "date-fns/locale/en-US"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import haversine from "haversine"

type Options = Parameters<typeof format>[2]

const getLocale = (): Locale => {
  const locale = I18n.currentLocale().split("-")[0]
  return locale === "ar" ? ar : locale === "ko" ? ko : en
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const locale = getLocale()
  const dateOptions = {
    ...options,
    locale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}

export function getFormattedDate(): string {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, "0")
  const month = String(today.getMonth() + 1).padStart(2, "0") // Months are zero-based
  const year = String(today.getFullYear()).slice(-2) // Get last two digits of the year

  return `${day}-${month}-${year}`
}

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatToLocalTime = (timeString) => {
  try {
    // Build a full ISO string
    const isoString = `1970-01-01T${timeString.replace(" GMT", "")}`
    const date = new Date(isoString)

    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", isoString)
      return "Invalid Date"
    }

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error parsing time:", error)
    return "Invalid Date"
  }
}

export const sortReportsByTime = (reports) => {
  return reports.sort((a, b) => {
    const timeA = dayjs(`1970-01-01 ${a.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z")
    const timeB = dayjs(`1970-01-01 ${b.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z")

    if (!timeA.isValid() || !timeB.isValid()) {
      console.error("Invalid time format:", a.time, b.time)
      return 0
    }

    return timeA - timeB
  })
}

const sortReportsByTimeDescending = (reports) => {
  return reports.sort((a, b) => {
    // Parse time strings using dayjs, treating them as occurring on the same day
    const timeA = dayjs(`1970-01-01T${a.time}`, "YYYY-MM-DDTHH:mm:ss [GMT]Z")
    const timeB = dayjs(`1970-01-01T${b.time}`, "YYYY-MM-DDTHH:mm:ss [GMT]Z")

    // Ensure the times are valid
    if (!timeA.isValid() || !timeB.isValid()) {
      console.error("Invalid time format:", a.time, b.time)
      return 0 // Preserve original order for invalid dates
    }

    // Sort descending: latest time first
    return timeB.valueOf() - timeA.valueOf()
  })
}

// export const sortReports = (reports, userCoords) => {
//   return reports.sort((a, b) => {
//     const timeA = dayjs(`1970-01-01 ${a.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z")
//     const timeB = dayjs(`1970-01-01 ${b.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z")
//     if (timeA.isValid() && timeB.isValid() && timeB - timeA !== 0) {
//       return timeB.valueOf() - timeA.valueOf()
//     }

//     const distanceA = haversine(userCoords, a.coords)
//     const distanceB = haversine(userCoords, b.coords)
//     return distanceA - distanceB
//   })
// }

export const sortReports = (reports, userCoords, options = {}) => {
  const {
    timeWeight = 0.5,  // Default weight for time (0-1 range)
    distanceWeight = 0.5  // Default weight for distance (0-1 range)
  } = options;

  return reports.sort((a, b) => {
    // Parse times
    const timeA = dayjs(`1970-01-01 ${a.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z");
    const timeB = dayjs(`1970-01-01 ${b.time}`, "YYYY-MM-DD HH:mm:ss [GMT]Z");

    // Calculate time difference (most recent first)
    let timeDiff = 0;
    if (timeA.isValid() && timeB.isValid()) {
      timeDiff = timeB.valueOf() - timeA.valueOf();
    }

    // Calculate distance
    const distanceA = haversine(userCoords, a.coords);
    const distanceB = haversine(userCoords, b.coords);
    const distanceDiff = distanceA - distanceB;

    // Normalize and combine time and distance
    const normalizedTimeDiff = timeDiff / (24 * 60 * 60 * 1000);  // Convert to days
    const normalizedDistanceDiff = distanceDiff / 1000;  // Convert to kilometers

    // Weighted combination of time and distance
    return (timeWeight * normalizedTimeDiff) + (distanceWeight * normalizedDistanceDiff);
  });
};
