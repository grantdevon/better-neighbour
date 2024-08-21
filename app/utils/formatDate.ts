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
