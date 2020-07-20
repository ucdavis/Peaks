import { IEquipment } from 'ClientApp/models/Equipment';

export const fakeEquipment: IEquipment[] = [
  {
    type: 'Card',
    serialNumber: '4DVNPD2',
    make: 'Dell',
    model: 'OptiPlex 7040',
    protectionLevel: null,
    availabilityLevel: null,
    systemManagementId: null,
    space: null,
    assignment: {
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
        isSupervisor: false,
      },
      id: 26,
      equipmentId: 123,
      equipment: null,
      expiresAt: null,
    },
    equipmentAssignmentId: 26,
    attributes: [
      {
        id: 3675,
        equipmentId: 24,
        key: 'calskey',
        value: '5'
      }
    ],
    id: 123,
    name: 'Desktop',
    notes: 'hhh',
    tags: '',
    teamId: 10
  }
];
