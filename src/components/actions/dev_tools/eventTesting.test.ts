// Configure a snapshot to be used with this test suite.

import { testTrigger } from './routes'

// Template type 1

test('Application create', async () => {
  const result = await testTrigger({ templateCode: 'OrgRegistration', trigger: 'create' })
  expect(result).toMatchObject({
    applicationId: 13,
    serial: 'S-KUO-0015',
    trigger: 'ON_APPLICATION_CREATE',
    actionResult: [
      {
        action: 'generateTextString',
        status: 'SUCCESS',
        output: {
          generatedText: 'S-BLC-0015',
        },
        errorLog: null,
      },
      {
        action: 'generateTextString',
        status: 'SUCCESS',
        output: {
          generatedText: 'Company Registration - S-BLC-0015',
        },
        errorLog: null,
      },
      {
        action: 'incrementStage',
        status: 'SUCCESS',
        output: {
          applicationId: 13,
          stageNumber: 1,
          stageName: 'Approval',
          stageHistoryId: 23,
          statusId: 23,
          status: 'DRAFT',
        },
        errorLog: null,
      },
    ],
    finalApplicationData: {
      applicationId: 13,
      applicationSerial: 'S-BLC-0014',
      applicationName: 'Company Registration - S-BLC-0014',
      sessionId: 'WXsvhggdwhlsHadx',
      templateId: 7,
      templateName: 'Company Registration',
      templateCode: 'OrgRegistration',
      stageId: 9,
      stageNumber: 1,
      stage: 'Approval',
      stageHistoryId: 23,
      stageHistoryTimeCreated: '2022-10-18T22:37:11.219Z',
      statusHistoryId: 23,
      status: 'DRAFT',
      statusHistoryTimeCreated: '2022-10-18T22:37:11.225Z',
      userId: 2,
      orgId: null,
      outcome: 'PENDING',
      firstName: 'Admin',
      lastName: 'Admin',
      username: 'admin',
      dateOfBirth: null,
      email: null,
      orgName: null,
      responses: {
        S1T1: null,
        activity: null,
        addressCheckbox: {
          text: '*<Nothing Selected>*',
          values: {
            '1': {
              text: 'Yes',
              selected: false,
              textNegative: '',
            },
          },
          selectedValuesArray: [],
        },
        logo: null,
        logoShow: null,
        name: null,
        orgInfo: null,
        otherDoc: null,
        physAdd: null,
        postAdd: null,
        rego: null,
        regoDoc: null,
      },
      reviewData: {},
      environmentData: {
        appRootFolder: '/Users/carl/GitHub/conforma/conforma-server/src',
        filesFolder: '../files',
        webHostUrl: 'http://localhost:3000',
      },
      sectionCodes: ['S1', 'S2'],
    },
  })
})
