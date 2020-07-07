import { IPersonInfo } from "ClientApp/models/People";

export const fakePeople: IPersonInfo[] = [
  {
    person: {
      id: 123,
      active: true,
      teamId: 10,
      user: null,
      userId: 'userid',
      firstName: 'Chuck',
      lastName: 'Yeager',
      name: 'Chuck Yeager',
      email: 'chuck@testpilot.gov',
      tags: null,
      title: null,
      homePhone: null,
      teamPhone: null,
      supervisorId: null,
      supervisor: null,
      startDate: null,
      endDate: null,
      category: null,
      notes: null,
      isSupervisor: true
    },
    id: 123,
    equipmentCount: 1,
    accessCount: 1,
    keyCount: 1,
    workstationCount: 0
  }
];
