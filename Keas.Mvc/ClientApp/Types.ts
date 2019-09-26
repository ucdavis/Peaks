import { History, Location } from "history";
import { match } from "react-router";

// Main Type of the context
// tslint:disable-next-line:interface-name
export interface AppContext {
    fetch: (url: string, init?: RequestInit) => any;
    router: {
        history: History;
        route: {
            location: Location;
            match: match<IRouteProps>;
        };
    };
    team: ITeam;
    permissions: string[];
}

export interface IRouteProps {
    id: string;
    action: string;

    assetType: string;

    personId: string;
    personAction: string;

    spaceId: string;
    spaceAction: string;

    keyId: string;
    keyAction: string;
}

export interface IUser {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    id: string;
    iam: string;
}

export interface IPerson {
    active?: boolean;
    id: number;
    userId: string;
    teamId: number;
    user?: IUser;
    tags: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    homePhone: string;
    teamPhone: string;
    title: string;
    supervisorId?: number;
    supervisor?: IPerson;
    startDate: Date;
    endDate: Date;
    category: string;
    notes: string;
    isSupervisor: boolean;
}

export interface IPersonInfo {
    person: IPerson;
    id: number;
    accessCount: number;
    equipmentCount: number;
    keyCount: number;
    workstationCount: number;
}

export interface ITeam {
    id: number;
    name: string;
    slug: string;
}

export interface IKeyInfo {
    id: number;
    key: IKey;
    serialsTotalCount: number;
    serialsInUseCount: number;
    spacesCount: number;
    code?: string;
}

export interface IKey {
    id: number;
    teamId: number;
    name: string;
    code: string;
    notes: string;
    tags: string;
    serials?: IKeySerial[];
    keyXSpaces?: IKeySpaceAssociation[];
}

export interface IKeySerial {
    id: number;
    number: string;
    tags: string;
    status: string;
    notes: string;
    key: IKey;
    keySerialAssignment?: IKeySerialAssignment;
}

export interface IKeySerialAssignment {
    id: number;
    expiresAt: Date;
    keySerial: IKeySerial;
    keySerialId: number;
    person: IPerson;
}

export interface IKeySpaceAssociation {
    id: number;
    spaceId: number;
    keyId: number;
    space?: ISpace;
    key?: IKey;
}

export interface IAccess {
    id: number;
    teamId: number;
    name: string;
    notes: string;
    tags: string;
    assignments: IAccessAssignment[];
}

export interface IAccessAssignment {
    id: number;
    accessId: number;
    expiresAt: Date;
    person: IPerson;
    personId: number;
}

export interface IEquipment {
    assignment?: IEquipmentAssignment;
    equipmentAssignmentId?: number;
    id: number;
    make: string;
    model: string;
    name: string;
    space: ISpace;
    serialNumber: string;
    tags: string;
    teamId: number;
    type: string;
    protectionLevel: string;
    availabilityLevel: string;
    systemManagementId: string;
    notes: string;
    attributes: IEquipmentAttribute[];
}

export interface IEquipmentAssignment {
    id: number;
    equipmentId: number;
    expiresAt: Date;
    equipment: IEquipment;
    person: IPerson;
}

export interface IEquipmentLabel {
    equipment: IEquipment;
    label: string;
}

export interface IHasExpiration {
    expiresAt: Date;
}

export interface IEquipmentAttribute {
    id?: number;
    equipmentId: number;
    key: string;
    value: string;
}

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
}

export interface IWorkstation {
    id: number;
    name: string;
    space: ISpace;
    tags: string;
    notes: string;
    teamId: number;
    assignment?: IWorkstationAssignment;
}

export interface IWorkstationAssignment {
    id: number;
    workstationId: number;
    expiresAt: Date;
    person: IPerson;
}

export interface IHistory {
    description: string;
    actedDate: Date;
    actionType?: string;
    assetType?: string;
    id: number;
}

export interface IBigFixSearchedName {
    id: string;
    name: string;
}
