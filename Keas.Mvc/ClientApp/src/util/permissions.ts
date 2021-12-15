export class PermissionsUtil {
  public static canViewKeys(r: string[]): boolean {
    const permissionArray = ['KeyMaster', 'DepartmentalAdmin'];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewEquipment(r: string[]): boolean {
    const permissionArray = ['EquipMaster', 'DepartmentalAdmin'];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewAccess(r: string[]): boolean {
    const permissionArray = ['AccessMaster', 'DepartmentalAdmin'];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewPeople(r: string[]): boolean {
    const permissionArray = [
      'EquipMaster',
      'KeyMaster',
      'DocumentMaster',
      'AccessMaster',
      'SpaceMaster',
      'DepartmentalAdmin',
      'PersonManager'
    ];
    return r.some(a => permissionArray.includes(a));
  }

  public static canEditPeople(r: string[]): boolean {
    const permissionArray = ['DepartmentalAdmin', 'PersonManager'];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewSpaces(r: string[]): boolean {
    const permissionArray = [
      'EquipMaster',
      'KeyMaster',
      'AccessMaster',
      'SpaceMaster',
      'DepartmentalAdmin'
    ];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewWorkstations(r: string[]): boolean {
    const permissionArray = ['SpaceMaster', 'DepartmentalAdmin'];
    return r.some(a => permissionArray.includes(a));
  }

  public static canViewDocuments(r: string[]): boolean {
    const permissionArray = ['DocumentMaster', 'DepartmentalAdmin'];
    return r.some(a => permissionArray.includes(a));
  }
}
