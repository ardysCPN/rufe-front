export class DateUtils {
    /**
     * Formats a Date object to a LocalDateTime string (ISO 8601 without 'Z' or timezone offset)
     * Format: YYYY-MM-DDTHH:mm:ss
     * Example: 2024-07-15T10:30:00
     * @param date The date to format
     * @returns formatted string or null if date is invalid
     */
    static toLocalDateTime(date: Date | string): string {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const pad = (n: number) => n < 10 ? '0' + n : n;

        return d.getFullYear() + '-' +
            pad(d.getMonth() + 1) + '-' +
            pad(d.getDate()) + 'T' +
            pad(d.getHours()) + ':' +
            pad(d.getMinutes()) + ':' +
            pad(d.getSeconds());
    }

    /**
     * Returns current local date time string in backend expected format
     */
    static currentLocalDateTime(): string {
        return this.toLocalDateTime(new Date());
    }
}
