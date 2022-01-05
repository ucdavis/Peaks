import { IKeySerial } from '../../../models/KeySerials';

export const fakeKeySerials: IKeySerial[] = [
  {
    number: '1312',
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
      name: 'Cereal',
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
        userId: 'eElric',
        firstName: 'Edward',
        lastName: 'Elric',
        name: 'Edward Elric',
        email: 'eElric@ucdavis.edu',
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
  },
  {
    number: '1313',
    status: 'Active',
    key: {
      code: 'SUBTRACT',
      keyXSpaces: null,
      serials: [
        {
          number: '2',
          status: 'Active',
          key: null,
          keyId: 25,
          keySerialAssignment: null,
          id: 968,
          notes: null
        }
      ],
      id: 25,
      name: 'Cereal',
      notes: null,
      tags: '',
      teamId: 10
    },
    keyId: 25,
    keySerialAssignment: {
      keySerial: null,
      keySerialId: 40,
      person: {
        id: 1250,
        active: true,
        teamId: 10,
        user: null,
        userId: 'aElric',
        firstName: 'Alphonse',
        lastName: 'Elric',
        name: 'Alphonse Elric',
        email: 'aElric@ucdavis.edu',
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
      id: 19,
      expiresAt: new Date('2022-01-15T23:23:22')
    },
    id: 41,
    notes: null
  },
  {
    number: '1315',
    status: 'Active',
    key: {
      code: 'SUBTRACT',
      keyXSpaces: null,
      serials: [
        {
          number: '2',
          status: 'Active',
          key: null,
          keyId: 26,
          keySerialAssignment: null,
          id: 968,
          notes: null
        }
      ],
      id: 26,
      name: 'Cereal',
      notes: null,
      tags: '',
      teamId: 10
    },
    keyId: 26,
    keySerialAssignment: {
      keySerial: null,
      keySerialId: 40,
      person: {
        id: 1251,
        active: true,
        teamId: 10,
        user: null,
        userId: 'rMustang',
        firstName: 'Roy',
        lastName: 'Mustang',
        name: 'Roy Mustang',
        email: 'rMustang@ucdavis.edu',
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
      id: 20,
      expiresAt: new Date('2022-01-15T23:23:22')
    },
    id: 42,
    notes: null
  }
];
