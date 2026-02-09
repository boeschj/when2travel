import { format, isValid, parseISO } from "date-fns";

import { DATE_FORMATS } from "./constants";

declare const ISODateBrand: unique symbol;
export type ISODateString = string & { [ISODateBrand]: true };

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function toISODateString(date: Date): ISODateString {
  const formatted = format(date, DATE_FORMATS.ISO);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const isoString = formatted as ISODateString;
  return isoString;
}

export function parseISODate(iso: ISODateString): Date {
  const date = parseISO(iso);
  return date;
}

function isISODateString(value: string): value is ISODateString {
  const hasValidFormat = ISO_DATE_REGEX.test(value);
  const parsedDate = parseISO(value);
  const isValidDate = isValid(parsedDate);
  const isValidISOString = hasValidFormat && isValidDate;
  return isValidISOString;
}

export function assertISODateString(value: string): ISODateString {
  if (!isISODateString(value)) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }
  return value;
}

export function parseAPIDate(value: string): Date {
  const isoString = assertISODateString(value);
  const date = parseISODate(isoString);
  return date;
}
