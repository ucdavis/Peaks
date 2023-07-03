export interface ISpaceInfo {
  space: ISpace;
  id: number;
  equipmentCount: number;
  keyCount: number;
  workstationsTotal: number;
  workstationsInUse: number;
  tags: string; // comma separated list of workstation tags in this space
}

export interface ISpace {
  id: number;
  roomKey: string;
  orgId: string;
  deptName: string;
  bldgName: string;
  floorName: string;
  roomName: string;
  roomNumber: string;
  sqFt: string;
  roomCategoryName: string;
  active: boolean;
}

export interface ISpaceShort {
  id: number;
  bldgName: string;
  deptName: string;
  roomNumber: string;
}
