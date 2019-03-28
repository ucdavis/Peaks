import * as moment from "moment";
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
            return !!row.expiresAt && moment(row.expiresAt).isSameOrBefore();
        }
        if (filter.value === "unexpired") {
            return !!row.expiresAt && moment(row.expiresAt).isAfter();
        }
        if (filter.value === "3weeks") {
            return (
                !!row.expiresAt &&
                moment(row.expiresAt).isAfter() &&
                moment(row.expiresAt).isBefore(moment().add(3, "w"))
            );
        }
        if (filter.value === "6weeks") {
            return (
                !!row.expiresAt &&
                moment(row.expiresAt).isAfter() &&
                moment(row.expiresAt).isBefore(moment().add(6, "w"))
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
        if (moment(a).isSame(b)) {
            return 0;
        } else {
            return moment(a).isBefore(b) ? -1 : 1;
        }
    }
}
