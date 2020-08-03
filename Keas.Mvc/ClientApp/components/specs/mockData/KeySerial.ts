import { IKeySerial } from 'ClientApp/models/KeySerials';

export const fakeKeySerials: IKeySerial[] = [
  {
    number: 'TTT',
    status: 'Active',
    key: {
      code: 'ADD',
      keyXSpaces: null,
      serials: [
        {
          number: '2',
          status: 'Active',
          key: null,
          keyId: 24,
          keySerialAssignment: null,
          id: 968,
          notes: null
        }
      ],
      id: 24,
      name: 'Breaks',
      notes: null,
      tags: '',
      teamId: 10
    },
    keyId: 24,
    keySerialAssignment: {
      keySerial: null,
      keySerialId: 40,
      person: {
        id: 1249,
        active: true,
        teamId: 10,
        user: null,
        userId: 'klanmiko',
        firstName: 'Kaelan',
        lastName: 'Mikowicz',
        name: 'Kaelan Mikowicz',
        email: 'ktmikowicz@ucdavis.edu',
        tags: 'Student',
        title: null,
        homePhone: null,
        teamPhone: null,
        supervisorId: null,
        supervisor: null,
        startDate: null,
        endDate: null,
        category: null,
        notes: null,
        isSupervisor: false
      },
      id: 18,
      expiresAt: new Date('2022-01-15T23:23:22')
    },
    id: 40,
    notes: null
  }
];
