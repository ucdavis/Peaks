export class PermissionsUtil {

    public static canViewKeys(r: string[]) {
        const permissionArray = ['KeyMaster', 'DepartmentalAdmin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static   canViewEquipment(r: string[]) {
        const permissionArray = ['EquipMaster', 'DepartmentalAdmin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canViewAccess(r: string[]) {
        const permissionArray = ['AccessMaster', 'DepartmentalAdmin'];
        return r.some(a => permissionArray.includes(a));
    }
   
    public static canViewPeople(r: string[]) {
        const permissionArray = ['EquipMaster', 'KeyMaster', 'AccessMaster', 'SpaceMaster', 'DepartmentalAdmin', 'PersonManager'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canEditPeople(r: string[]) {
        const permissionArray = ['DepartmentalAdmin', 'PersonManager'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canViewSpaces(r: string[]) {
        const permissionArray = ['EquipMaster', 'KeyMaster', 'AccessMaster', 'SpaceMaster', 'DepartmentalAdmin'];
        return r.some(a => permissionArray.includes(a));
    }

    public static canViewWorkstations(r: string[]) {
        const permissionArray = ['SpaceMaster', 'DepartmentalAdmin'];
        return r.some(a => permissionArray.includes(a));
    }
}
