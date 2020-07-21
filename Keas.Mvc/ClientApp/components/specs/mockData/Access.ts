import { IAccess } from 'ClientApp/models/Access';

export const fakeAccesses: IAccess[] = [
  {
    assignments: [
      {
        accessId: 15,
        person: {
          id: 1249,
          active: true,
          teamId: 10,
          user: null,
          userId: 'iKurosaki',
          firstName: 'Ichigo',
          lastName: 'Kurosaki',
          name: 'Ichigo Kurosaki',
          email: 'ikurosaki@ucdavis.edu',
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
        id: 77,
        personId: 1249,
        expiresAt: new Date('2022-11-12T00:00:00'),
        access: {
          assignments: [
            {
              accessId: 15,
              person: {
                id: 1249,
                active: true,
                teamId: 10,
                user: null,
                userId: 'iKurosaki',
                firstName: 'Ichigo',
                lastName: 'Kurosaki',
                name: 'Ichigo Kurosaki',
                email: 'ikurosaki@ucdavis.edu',
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
                isSupervisor: false,
              },
              id: 77,
              personId: 1249,
              expiresAt: new Date('2022-11-12T00:00:00'),
              access: null
            }
          ],
          id: 15,
          name: 'Real Access',
          notes: null,
          tags: '',
          teamId: 10,
        }
      }
    ],
    id: 15,
    name: 'Real Access',
    notes: null,
    tags: '',
    teamId: 10
  },
  {
    assignments: [
      {
        accessId: 16,
        person: {
          id: 1250,
          active: true,
          teamId: 10,
          user: null,
          userId: 'rMustang',
          firstName: 'Roy',
          lastName: 'Mustang',
          name: 'Roy Mustang',
          email: 'rmustang@ucdavis.edu',
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
        id: 78,
        personId: 1250,
        expiresAt: new Date('2022-11-12T00:00:00'),
        access: {
          assignments: [
            {
              accessId: 16,
              person: {
                id: 1250,
                active: true,
                teamId: 10,
                user: null,
                userId: 'rMustang',
                firstName: 'Roy',
                lastName: 'Mustang',
                name: 'Roy Mustang',
                email: 'rmustang@ucdavis.edu',
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
                isSupervisor: false,
              },
              id: 78,
              personId: 1250,
              expiresAt: new Date('2022-11-12T00:00:00'),
              access: null
            }
          ],
          id: 16,
          name: 'Test Access',
          notes: null,
          tags: '',
          teamId: 10,
        }
      }
    ],
    id: 16,
    name: 'Test Access',
    notes: null,
    tags: '',
    teamId: 10
  }
];
