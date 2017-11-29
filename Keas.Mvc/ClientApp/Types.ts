// Main Type of the context
export interface AppContext {
  team: any; //TODO: define team
  person: IPerson;
}

export interface IUser {
  name: string;
  email: string;
}

export interface IPerson {
  id: number;
  userid: number;
  user: IUser;
}

export interface IKey {
    id: Number;
    name: String;
}

export interface IKeyAssignment {
  id: Number;
  keyId: Number;
  expiresAt: Date;
  key: IKey;
}
