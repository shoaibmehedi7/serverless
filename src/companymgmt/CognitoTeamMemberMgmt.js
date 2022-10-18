import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, addBulkRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";
import * as AWS from "aws-sdk";
import { addDefaultCompanyInfo } from "./CompanyMgmt";
import { addApplTeamMemberCore } from "./ApplTeamMemberMgmt";
import { addApplRoleCore } from "./ApplRolesMgmt";
import { addCompanyDeptCore } from "./CompanyDeptMgmt";
import screens from "../constants/screens.json";
import roles from "../constants/roles.json";
import applRoles from "../constants/applRoles.json";
import companyDepts from "../constants/companyDepts.json";
import categoryApplications from "../constants/categoryApplications.json";
import dummyCompany from "../data/dummyCompany.json";

import screenRoleMapping from "../constants/screenRoleMapping.json";
import { SNS_JOTP_SYSTEM_TRIGGER } from "../commons/utils/sns/sns";
// Initialize CognitoIdentityServiceProvider.
const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const USERPOOLID = "us-east-1_sMfS6AGOx";

export const addCognitoTeamMember = async (record) => {
  const password = "SnRApps!" + Math.random().toString(36).substr(2, 10);
  console.log(`password ${password}`);
  //exports.handler = async (event, context) => {
  const cognitoParams = {
    UserPoolId: USERPOOLID,
    Username: record.email,
    UserAttributes: [
      {
        Name: "email",
        Value: record.email,
      },
      {
        Name: "email_verified",
        Value: "false",
      },
    ],
    TemporaryPassword: password,
  };

  let response = await cognito.adminCreateUser(cognitoParams).promise();
  console.log(JSON.stringify(response, null, 2));
  // }
};

export const deleteCognitoTeamMember = async (record) => {
  try {
    const cognitoParams = {
      UserPoolId: USERPOOLID,
      Username: record.email,
    };
    let response = await cognito.adminDeleteUser(cognitoParams).promise();
    console.log(JSON.stringify(response, null, 2));
    return { body: true };
  } catch (error) {
    return {
      body: false,
      error,
    };
  }
};

export const addTeamMemberToDb = async (event, context, callback) => {
  console.log("EVENT:::::" + JSON.stringify(event));
  console.log("context:123::::" + JSON.stringify(context));
  let recordObj = {};

  recordObj.snrId = "SNR_APPS";
  recordObj.COMPANY_STATUS = "NEW";
  console.log("context:456::::");
  let companyCreationResponse = await addDefaultCompanyInfo(recordObj);
  console.log("companyCreationResponse");
  console.log(companyCreationResponse);
  let bodyResponse = JSON.parse(companyCreationResponse.body);
  let companyId = bodyResponse.companyId;
  recordObj.email = event.request.userAttributes.email;
  recordObj.phoneNumber = event.request.userAttributes.phone_number;
  recordObj.userName = event.userName;
  recordObj.companyId = companyId;
  recordObj.applsRoleName = "COMPANY_ADMIN";
  recordObj.authRoleName = "COMPANY_ADMIN";
  recordObj.authRole = "Company Admin";
  console.log("addApplTeamMemberCore...before");
  console.log(recordObj);
  await doOnboardingActivities(recordObj);
  let teamMemberResponse = await addApplTeamMemberCore(recordObj, false);

  console.log(recordObj);
  callback(null, event);
};

export const doOnboardingActivities = async (recordObj) => {
  console.log("doOnboardingActivities....called");
  console.log(JSON.stringify(recordObj));
  await SNS_JOTP_SYSTEM_TRIGGER(recordObj);
  // if (await addDefaultScreensForCompany(recordObj)) {
  //   if (await addDefaultRolesForCompany(recordObj)) {
  //     //await addDefaultScreensRolesMappingForCompany(recordObj.companyId);

  //   }
  // }
};

export const addDefaultCmpnyInfo = async (record) => {
  let recordObj = JSON.parse(record["Records"][0].Sns.Message);
  let companyId = recordObj.companyId;
  if (await addDefaultScreensForCompany(recordObj)) {
    if (await addDefaultRolesForCompany(recordObj)) {
      if (await addDefaultScrnsRlsMpNgForCmpny(recordObj)) {
        if (await addDefaultApplRoles(recordObj)) {
          if (await addDefaultDepts(recordObj)) {
            if (await addDefaultCategoryApplicationForCompany(recordObj)) {
              console.log("DEFAULT DATA LOADED");
            }
          }
        }
      }
    }
  }
  //add user in cognito
};

export const addDefaultApplRoles = async (recordObj) => {
  for (var i = 0; i < applRoles.length; i++) {
    console.log("addDefaultApplRoles...." + i);
    let eachApplRole = applRoles[i];
    eachApplRole.companyId = recordObj.companyId;
    let response = await addApplRoleCore(eachApplRole);
    console.log("addDefaultApplRoles...." + JSON.stringify(response));
    if (response) {
      return true;
    } else {
      return false;
    }
  }
};

export const addDefaultDepts = async (recordObj) => {
  for (var i = 0; i < companyDepts.length; i++) {
    console.log("addDefaultScreensRolesMappingForCompany...." + i);
    let eachCompanyDept = companyDepts[i];
    eachCompanyDept.companyId = recordObj.companyId;
    let response = await addCompanyDeptCore(eachCompanyDept);
    if (response != null && response.statusCode == "200") {
      // rolesMap[i]=miniRole;
      //  let getResponse = await getAuthRoleCore (recordObj);
      //console.log(`getResponse:: ${addResponse.body.Items[0]}`);
      //return apiResponse(getResponse.body.Items[0]);
    } else {
      console.log("FAILED to addDefaultScrnsRlsMpNgForCmpny");
      console.log(JSON.stringify(response));
      return false;
    }
  }
  return true;
};

export const addDefaultScrnsRlsMpNgForCmpny = async (recordObj) => {
  let companyId = recordObj.companyId;
  console.log("addDefaultScrnsRlsMpNgForCmpny....companyId....." + companyId);

  for (var i = 0; i < screenRoleMapping.length; i++) {
    console.log("addDefaultScreensRolesMappingForCompany...." + i);
    let eachScreenRoleMapping = screenRoleMapping[i];

    eachScreenRoleMapping.companyId = companyId;

    let requiredFields = ["companyId"];
    eachScreenRoleMapping.expiryDate = expiryDate();
    eachScreenRoleMapping.authScrnMappingId = uuidv4();
    console.log(eachScreenRoleMapping);
    // let addResponse ={};
    // addResponse.statusCode ="200";
    let addResponse = await addRecord(
      eachScreenRoleMapping,
      requiredFields,
      AppConfig.CMMN_AUTHENTICATION_X_SCRNS
    );

    if (addResponse != null && addResponse.statusCode == "200") {
      // rolesMap[i]=miniRole;
      //  let getResponse = await getAuthRoleCore (recordObj);
      //console.log(`getResponse:: ${addResponse.body.Items[0]}`);
      //return apiResponse(getResponse.body.Items[0]);
    } else {
      console.log("FAILED to addDefaultScrnsRlsMpNgForCmpny");
      console.log(JSON.stringify(addResponse));
      return false;
    }
  }

  return true;
};

// export const addDefaultScreensRolesMappingForCompany = async (companyId) =>  {
//   console.log("addDefaultScreensRolesMappingForCompany....called....."+screenRoleMapping.length);
//   let requiredFields=[];
//   let addResponse = await addBulkRecord(
//     screenRoleMapping,
//     requiredFields,
//     AppConfig.CMMN_AUTHENTICATION_X_SCRNS
//   );
// /*
//   for (var i=0; i<screenRoleMapping.length; i++) {
//     console.log("addDefaultScreensRolesMappingForCompany...."+i);
//     let eachScreenRoleMapping = screenRoleMapping[i];

//     eachScreenRoleMapping.companyId=companyId;

//     let requiredFields = ["companyId"];
//     eachScreenRoleMapping.expiryDate = expiryDate();
//     eachScreenRoleMapping.authScrnMappingId= uuidv4();
//     console.log(eachScreenRoleMapping);
//     // let addResponse ={};
//     // addResponse.statusCode ="200";
//     let addResponse = await addRecord(
//       eachScreenRoleMapping,
//       requiredFields,
//       AppConfig.CMMN_AUTHENTICATION_X_SCRNS
//     );

//     if (addResponse != null && addResponse.statusCode == "200") {
//      // rolesMap[i]=miniRole;
//     //  let getResponse = await getAuthRoleCore (recordObj);
//       //console.log(`getResponse:: ${addResponse.body.Items[0]}`);
//       //return apiResponse(getResponse.body.Items[0]);
//     } else {
//       return apiError(500, addResponse);
//     }

//   }
//   */
//   return true;

// }

export const addDefaultRolesForCompany = async (recordObj) => {
  for (var i = 0; i < roles.length; i++) {
    let eachRole = roles[i];
    console.log(eachRole);
    let roleList;
    eachRole.companyId = recordObj.companyId;

    let requiredFields = ["companyId"];
    recordObj.expiryDate = expiryDate();
    recordObj.authRoleId = uuidv4();
    let addResponse = await addRecord(
      eachRole,
      requiredFields,
      AppConfig.CMMN_AUTH_ROLES
    );

    if (addResponse != null && addResponse.statusCode == "200") {
      //  let getResponse = await getAuthRoleCore (recordObj);
      //console.log(`getResponse:: ${addResponse.body.Items[0]}`);
      //return apiResponse(getResponse.body.Items[0]);
    } else {
      console.log("FAILED to addDefaultRolesForCompany");
      console.log(JSON.stringify(addResponse));
      return false;
    }
  }
  return true;
};

export const addDefaultScreensForCompany = async (recordObj) => {
  //console.log("screensList...called"+JSON.stringify(screens));

  for (var i = 0; i < screens.length; i++) {
    console.log("eachScreen...");
    let eachScreen = screens[i];
    console.log(eachScreen);

    eachScreen.companyId = recordObj.companyId;
    console.log(eachScreen);
    let requiredFields = ["companyId"];
    eachScreen.expiryDate = expiryDate();
    eachScreen.authScrnId = uuidv4();
    let addResponse = await addRecord(
      eachScreen,
      requiredFields,
      AppConfig.CMMN_SCRNS
    );

    if (addResponse != null && addResponse.statusCode == "200") {
      console.log("record added to screens");
    } else {
      console.log("FAILED TO addDefaultScreensForCompany");
      console.log(JSON.stringify(addResponse));
      return false;
    }
  }
  return true;
};

export const addDefaultCategoryApplicationForCompany = async (recordObj) => {
  const category = categoryApplications;

  for (var i = 0; i < category.length; i++) {
    console.log("eachCategory...");
    let eachCategory = category[i];
    console.log(eachCategory);

    eachCategory.companyId = recordObj.companyId;
    console.log(eachCategory);
    let requiredFields = ["companyId"];
    eachCategory.expiryDate = expiryDate();
    eachCategory.applicationCategoryId = uuidv4();
    let addResponse = await addRecord(
      eachCategory,
      requiredFields,
      AppConfig.DBT_COMPANY_APPL_CATEGORY
    );

    if (addResponse != null && addResponse.statusCode == "200") {
      console.log("record added to Categorys");
    } else {
      console.log("FAILED TO addDefaultCategorysForCompany");
      console.log(JSON.stringify(addResponse));
      return false;
    }
  }
  return true;
};

export const addDefaultDummyCompany = async (recordObj) => {
  for (var i = 0; i < category.length; i++) {
    console.log("eachCategory...");
    let eachCategory = category[i];
    console.log(eachCategory);

    eachCategory.companyId = recordObj.companyId;
    console.log(eachCategory);
    let requiredFields = ["companyId"];
    eachCategory.expiryDate = expiryDate();
    eachCategory.applicationCategoryId = uuidv4();
    let addResponse = await addRecord(
      eachCategory,
      requiredFields,
      AppConfig.DBT_COMPANY_APPL_CATEGORY
    );

    if (addResponse != null && addResponse.statusCode == "200") {
      console.log("record added to Categorys");
    } else {
      console.log("FAILED TO addDefaultCategorysForCompany");
      console.log(JSON.stringify(addResponse));
      return false;
    }
  }
  return true;
};
