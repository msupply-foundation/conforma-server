const compileJWTdata = [
  // Test JWT generation: 1
  {
    userInfo: {
      userId: 1,
      username: 'Check',
    },
    templatePermissionRows: [
      {
        permissiontType: 'Check',
        templateCode: 'Check',
        userId: 10,
        username: 'Check',
        permissionPolicyRules: {},
        templatePermissionRestrictions: {
          restrictOne: 1,
          restrictTwo: 2,
        },
        templateId: 1,
        permissionPolicyId: 2,
        permissionNameId: 3,
        templatePermissionId: 4,
      },
    ],
    result: {
      aud: 'postgraphile',
      userId: 1,
      pp2pn3: true,
      pp2pn3tp4: true,
      pp2pn3tp4_templateId: '1',
      pp2pn3tp4_restrictOne: '1',
      pp2pn3tp4_restrictTwo: '2',
    },
  },
  // Test JWT generation: 2
  {
    userInfo: {
      firstName: null,
      lastName: null,
      userId: 10,
      username: 'userWithMultiplePermissions',
      dateOfBirth: null,
      email: null,
    },
    templatePermissionRows: [
      {
        permissionType: 'Apply',
        permissionPolicyId: 1,
        permissionPolicyRules: {},
        permissionNameId: 1,
        templatePermissionId: 1,
        templatePermissionRestrictions: null,
        templateId: 1,
        templateCode: 'Demo',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {},
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
      {
        permissionType: 'Review',
        permissionPolicyId: 3,
        permissionPolicyRules: {},
        permissionNameId: 3,
        templatePermissionId: 3,
        templatePermissionRestrictions: {
          stage: 1,
        },
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
    ],
    result: {
      pp3pn3tp3: true,
      pp3pn3tp3_stage: '1',
      pp3pn3tp3_templateId: '2',
      pp3pn3: true,
      pp2pn2tp2: true,
      pp2pn2tp2_templateId: '2',
      pp2pn2: true,
      pp1pn1tp1: true,
      pp1pn1tp1_templateId: '1',
      pp1pn1: true,
      userId: 10,
      aud: 'postgraphile',
    },
  },
]

const generateRowLevelPoliciesData = [
  // Test Row Level Policies Generation: 1
  {
    permissionRows: [
      {
        permissionPolicyId: 2,
        permissionNameId: 2,
        templatePermissionId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
      },
    ],
    result: [
      `CREATE POLICY "view_pp2pn2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2_templateId')) `,
      `CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')) `,
    ],
  },
  {
    // Test Row Level Policies Generation: 2
    permissionRows: [
      {
        permissionType: 'Apply',
        permissionPolicyId: 1,
        permissionPolicyRules: {
          application: {
            view: {
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 1,
        templatePermissionId: 1,
        templatePermissionRestrictions: null,
        templateId: 1,
        templateCode: 'Demo',
        userId: 9,
        username: 'nonRegistered',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 1,
        username: 'nmadruga',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 2,
        username: 'carl',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 3,
        username: 'andrei',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 4,
        username: 'valerio',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 1,
        permissionPolicyRules: {
          application: {
            view: {
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 1,
        templatePermissionId: 1,
        templatePermissionRestrictions: null,
        templateId: 1,
        templateCode: 'Demo',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
      {
        permissionType: 'Apply',
        permissionPolicyId: 2,
        permissionPolicyRules: {
          application: {
            view: {
              user_id: 'jwtUserDetails_bigint_userId',
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 2,
        templatePermissionId: 2,
        templatePermissionRestrictions: null,
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
      {
        permissionType: 'Review',
        permissionPolicyId: 3,
        permissionPolicyRules: {
          application: {
            view: {
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 3,
        templatePermissionId: 3,
        templatePermissionRestrictions: {
          stage: 1,
        },
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 10,
        username: 'userWithMultiplePermissions',
      },
      {
        permissionType: 'Review',
        permissionPolicyId: 3,
        permissionPolicyRules: {
          application: {
            view: {
              template_id: 'jwtPermission_bigint_templateId',
            },
          },
        },
        permissionNameId: 3,
        templatePermissionId: 3,
        templatePermissionRestrictions: {
          stage: 1,
        },
        templateId: 2,
        templateCode: 'CompRego1',
        userId: 4,
        username: 'valerio',
      },
    ],
    result: [
      `CREATE POLICY "view_pp1pn1" ON "application" FOR SELECT USING (jwt_get_boolean('pp1pn1') = true and template_id = jwt_get_bigint('pp1pn1_templateId')) `,
      `CREATE POLICY "view_pp1pn1tp1" ON "application" FOR SELECT USING (jwt_get_boolean('pp1pn1tp1') = true and template_id = jwt_get_bigint('pp1pn1tp1_templateId')) `,
      `CREATE POLICY "view_pp2pn2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2_templateId')) `,
      `CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')) `,
      `CREATE POLICY "view_pp3pn3" ON "application" FOR SELECT USING (jwt_get_boolean('pp3pn3') = true and template_id = jwt_get_bigint('pp3pn3_templateId')) `,
      `CREATE POLICY "view_pp3pn3tp3" ON "application" FOR SELECT USING (jwt_get_boolean('pp3pn3tp3') = true and template_id = jwt_get_bigint('pp3pn3tp3_templateId')) `,
    ],
  },
]
export { compileJWTdata, generateRowLevelPoliciesData }
