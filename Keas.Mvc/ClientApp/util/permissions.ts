export class PermissionsUtil {

    public static canViewKeys(r: string[]) {
        const permissionArray = ['KeyMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static   canViewEquipment(r: string[]) {
        const permissionArray = ['EquipMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canViewAccess(r: string[]) {
        const permissionArray = ['AccessMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }
   
    public static canViewPeople(r: string[]) {
        const permissionArray = ['EquipMaster', 'KeyMaster', 'AccessMaster', 'SpaceMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canViewSpace(r: string[]) {
        const permissionArray = ['SpaceMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }
}
