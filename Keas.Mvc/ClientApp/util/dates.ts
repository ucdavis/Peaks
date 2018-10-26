import * as moment from "moment";
import { IHasExpiration} from "../Types";

export class DateUtil {
    
    public static formatExpiration(expiration: Date) {
        if(expiration === null) {
            return "";
        }
        return moment(expiration).format("MM/DD/YYYY").toString();
    }

    public static formatAssignmentExpiration(assignment: IHasExpiration) {
        if(!assignment || !assignment.expiresAt)
        {
            return "";
        }        
        return moment(assignment.expiresAt).format("MM/DD/YYYY").toString();
    }

    public static formatFirstExpiration(expirations: Date[]) {
        if(expirations.length === 0) {
            return "";
        }
        const dates = expirations.map(x=> moment(x));
        return moment.min(dates).format("MM/DD/YYYY").toString()
    }
}