import { Inject, Injectable } from "@angular/core";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import IMask from "imask";
import { DateTime } from "luxon";

@Injectable()
export class DateLocaleMaskService {
  private readonly datePartsMap = new Map<string, string>([
    ["month", "MM"],
    ["day", "dd"],
    ["year", "y"],
  ]);

  locale: string = "en-US";
  datePartsSeparator: string = "/";

  constructor(@Inject(MAT_DATE_LOCALE) currentDateLocale: string) {
    this.locale = currentDateLocale;
  }

  createDateMask(): IMask.MaskedDate {
    const localeFormat = this.getDateFormat();
    return IMask.createMask({
      mask: Date,
      pattern: this.getDateMaskPattern(localeFormat),
      lazy: true,
      overwrite: true,
      blocks: {
        dd: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 31,
          maxLength: 2,
        },
        MM: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
          maxLength: 2,
        },
        y: {
          mask: IMask.MaskedRange,
          from: 1900,
          to: 9999,
        },
      },
      format: (date: Date) => DateTime.fromJSDate(date).toFormat(localeFormat),
      parse: (str: string) => DateTime.fromFormat(str, localeFormat).toJSDate(),
    });
  }

  createTimeMask(): IMask.MaskedDate {
    const timeFormat = this.getTimeFormat();
    return IMask.createMask({
      mask: Date,
      pattern: "HH:`mm",
      lazy: true,
      overwrite: true,
      blocks: {
        HH: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 23,
          maxLength: 2,
        },
        mm: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59,
          maxLength: 2,
        },
      },
      format: (date: Date) => DateTime.fromJSDate(date).toFormat(timeFormat),
      parse: (str: string) => DateTime.fromFormat(str, timeFormat).toJSDate(),
    });
  }

  getDateMaskUpdateOptions(): Partial<IMask.MaskedDateOptions> {
    const localeDateFormat = this.getDateFormat();
    return {
      pattern: this.getDateMaskPattern(localeDateFormat),
      format: (date: Date) =>
        DateTime.fromJSDate(date).toFormat(localeDateFormat),
      parse: (str: string) =>
        DateTime.fromFormat(str, localeDateFormat).toJSDate(),
    };
  }

  getDateFormat(): string {
    const parts: Array<string> = new Array<string>();
    const partTypes = DateTime.now()
      .setLocale(this.locale)
      .toLocaleParts()
      .map((x) => x.type);
    partTypes.forEach((x) => {
      const part = this.datePartsMap.get(x);
      if (!!part) parts.push(part);
    });
    return parts.join(this.datePartsSeparator);
  }

  getTimeFormat(): string {
    return "HH:mm";
  }

  getDateNoMaskLength(): number {
    return 8;
  }

  getTimeNoMaskLength(): number {
    return 4;
  }

  fromJSDate(date: Date | null, time: Date | null): DateTime | null {
    if (!date) return null;

    let workDate: DateTime = DateTime.fromObject({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date?.getDate(),
    });

    if (!!time)
      workDate = DateTime.fromObject({
        year: workDate.year,
        month: workDate.month,
        day: workDate.day,
        hour: time.getHours(),
        minute: time.getMinutes(),
      });

    return workDate;
  }

  private getDateMaskPattern(format: string): string {
    const parts = format.split(this.datePartsSeparator);
    parts[1] = "`".concat(parts[1]);
    parts[2] = "`".concat(parts[2]);
    return parts.join(this.datePartsSeparator);
  }
}
