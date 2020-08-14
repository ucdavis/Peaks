import { IPerson } from "./People";
import { ITeam } from "./Shared";

export interface IDocument {
  id: number;
  envelopeId: string;
  templateId: string;
  status: string;
  name: string;
  tags: string;
  personId: number;
  person: IPerson;
  teamId: number;
  team: ITeam;
  notes: string;
}

export interface IDocumentTemplate {
  id: number;
  templateId: string;
  name: string;
  teamId: number;
}