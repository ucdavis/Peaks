// Main Type of the context
export interface AppContext {
  team: String;
  teamId: Number;
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
