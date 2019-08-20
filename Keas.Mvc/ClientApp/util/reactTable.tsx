import { addYears, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import * as React from "react";

export class ReactTableExpirationUtil {
    public static filterMethod(filter, row) {
        if (filter.value === "all") {
            return true;
        }
        if (filter.value === "unassigned") {
            return !row.expiresAt;
        }
        if (filter.value === "expired") {
            return !!row.expiresAt && !isAfter(new Date(row.expiresAt), new Date());
        }
        if (filter.value === "unexpired") {
            return !!row.expiresAt && isAfter(new Date(row.expiresAt), new Date());
        }
        if (filter.value === "3weeks") {
            return (
                !!row.expiresAt &&
                isAfter(new Date(row.expiresAt), new Date()) &&
                isBefore(new Date(row.expiresAt), addYears(startOfDay(new Date()), 3))
            );
        }
        if (filter.value === "6weeks") {
            return (
                !!row.expiresAt &&
                isAfter(new Date(row.expiresAt), new Date()) &&
                isBefore(new Date(row.expiresAt), addYears(startOfDay(new Date()), 6))
            );
        }
    }

    public static filter(filter, onChange) {
        return (
            <select
                onChange={e => onChange(e.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">Show All</option>
                <option value="unassigned">Unassigned</option>
                <option value="expired">Expired</option>
                <option value="unexpired">All Unexpired</option>
                <option value="3weeks">Expiring within 3 weeks</option>
                <option value="6weeks">Expiring within 6 weeks</option>
            </select>
        );
    }

    public static sortMethod(a, b) {
        if (!b) {
            return -1;
        }
        if (!a) {
            return 1;
        }
        if (isSameDay(new Date(a), new Date(b))) {
            return 0;
        } else {
            return isBefore(new Date(a), new Date(b)) ? -1 : 1;
        }
    }
}
