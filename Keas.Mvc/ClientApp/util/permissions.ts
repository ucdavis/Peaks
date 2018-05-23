export class PermissionsUtil {

    static canViewKeys(r: Array<string>) {
        const permissionArray = ['KeyMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    static   canViewEquipment(r: Array<string>) {
        const permissionArray = ['EquipMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    static canViewAccess(r: Array<string>) {
        const permissionArray = ['AccessMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }
   
    static canViewPeople(r: Array<string>) {
        const permissionArray = ['EquipMaster', 'KeyMaster', 'AccessMaster', 'SpaceMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }

    static canViewSpace(r: Array<string>) {
        const permissionArray = ['SpaceMaster', 'DepartmentalAdmin', 'Admin'];
        return r.some(a => permissionArray.includes(a));
    }
}
