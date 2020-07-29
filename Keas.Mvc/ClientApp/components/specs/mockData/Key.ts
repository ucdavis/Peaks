import { IKeyInfo } from 'ClientApp/models/Keys';

export const fakeKeys: IKeyInfo[] = [
  {
    key: {
      code: 'ER',
      keyXSpaces: null,
      serials: null,
      id: 23,
      name: 'Test',
      notes: null,
      tags: 'Student',
      teamId: 10
    },
    id: 23,
    spacesCount: 0,
    serialsInUseCount: 1,
    serialsTotalCount: 1
  },
  {
    key: {
      code: 'AMS',
      keyXSpaces: null,
      serials: null,
      id: 24,
      name: 'Real',
      notes: null,
      tags: 'Student',
      teamId: 10
    },
    id: 24,
    spacesCount: 0,
    serialsInUseCount: 1,
    serialsTotalCount: 1
  },
  {
    key: {
      code: 'CMS',
      keyXSpaces: null,
      serials: null,
      id: 25,
      name: 'Fake',
      notes: null,
      tags: 'Student',
      teamId: 10
    },
    id: 25,
    spacesCount: 0,
    serialsInUseCount: 1,
    serialsTotalCount: 1
  }
];
