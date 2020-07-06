module.exports = {
  roots: ['<rootDir>/ClientApp'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/ClientApp/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/ClientApp/components/specs/styleMock.ts'
  },
  reporters: [
    'default',
    [
      'jest-trx-results-processor',
      {
        outputFile: './ClientApp/jestTestresults.trx',
        defaultUserName: 'user name to use if automatic detection fails'
      }
    ]
  ]
};
