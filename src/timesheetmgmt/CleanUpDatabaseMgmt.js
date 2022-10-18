import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import {
  addRecord,
  deleteRecord,
  getRecord,
  updateRecord,
} from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";
import {
  deleteCompanyMgmt,
  getCompanyInfoCore,
} from "../companymgmt/CompanyMgmt";
import {
  deleteApplTeamMember,
  getApplTeamMembers,
  getApplTeamMemberCore,
} from "../companymgmt/ApplTeamMemberMgmt";
import { deleteProjectCode, getProjectCodes } from "./ProjectInTimeSheetMgmt";
import {
  deleteTimeSheetDetails,
  getTimeSheetDetails,
} from "./TimeSheetDtlsMgmt";
import {
  deleteTimeSheet,
  getTimeSheetsForCompany,
} from "./TimeSheetInTimeSheetMgmt";
import { deleteClient, getClients } from "./ClientInTimeSheetMgmt";
import { deleteVendor, getVendors } from "./VendorInTimeSheetMgmt";
import {
  deleteCompanyDeptMgmt,
  getCompanyDeptMgmts,
} from "../companymgmt/CompanyDeptMgmt";
import {
  deleteDeptApplMgmt,
  getAllCompanyDeptAppls,
} from "../companymgmt/DeptApplMgmt";
import {
  deleteApplTeamMemberAssignment,
  getAssignmentForCompany,
} from "../companymgmt/TeamMemberDetails";
import { deleteApplRole, getApplRoles } from "../companymgmt/ApplRolesMgmt";
import {
  deleteApplicationCategory,
  getApplicationCategorys,
} from "../companymgmt/ApplicationCategoryMgmt";
import {
  deleteAuthRole,
  getAuthRoles,
} from "../app-auth-screen-mapping-mgmt/AuthRoleMgmt";
import {
  deleteAuthScrnMapping,
  getAuthScrnMappings,
} from "../app-auth-screen-mapping-mgmt/AuthScrnMapping";
import {
  deleteAuthScrn,
  getAuthScrns,
} from "../app-auth-screen-mapping-mgmt/AuthScrnMgmt";

//get companyId
//get email
//get teammemberId
//get snrId

// get all project by company => use for loop to delete all project
// get all team member by company => use for loop to delete all team member
// get all timesheet by company => use for loop to delete all timesheet
// get all timesheet details by company => use for loop to delete all timesheet details
// get all clients by company => use for loop to delete all clients
// get all vendors by company => use for loop to delete all vendors
// get all departments by company => use for loop to delete all departments
// get all appls by company => use for loop to delete all appls
// get all assignment by company => use for loop to delete all assignment
// get all appls screen by company => use for loop to delete all appls screen
// get all auth role by company => use for loop to delete all auth role
// get all screen role by company => use for loop to delete all screen role
// get all task category by company => use for loop to delete all task category

// => delete teammember by companyId and teammemberId
// => delete cognito user by email
// => delete company by snrId and companyId

export const deepDeleteCompany = async (record) => {
  let recordObj = {};
  let deleteResultArray = [];
  recordObj.snrId = record.pathParameters.snrId;
  recordObj.snrAppsId = record.pathParameters.snrId;
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.email = record.pathParameters.email;
  recordObj.teamMemberId = record.pathParameters.teamMemberId;

  //delete appls team member + cognito
  const teamMemberCore = await getApplTeamMemberCore(recordObj);

  console.log("teamMemberCore", JSON.stringify(teamMemberCore));
  const teamMemberCoreArray = teamMemberCore.body.Items;
  console.log("teamMemberCoreArray", JSON.stringify(teamMemberCoreArray));

  if (+teamMemberCore.statusCode === 200 && teamMemberCoreArray.length) {
    const deleteApplTeamMemberResponse = await deleteApplTeamMember({
      pathParameters: recordObj,
    });

    console.log(
      "deleteApplTeamMemberResponse",
      JSON.stringify(deleteApplTeamMemberResponse)
    );
    deleteResultArray.push([
      {
        applTeam_TMB_COGNITO_TMB: JSON.parse(deleteApplTeamMemberResponse.body),
      },
    ]);
  }

  //delete company
  const companyInfoCore = await getCompanyInfoCore(recordObj);
  console.log("companyInfoCore", JSON.stringify(companyInfoCore));
  const companyInfoCoreArray = companyInfoCore.body.Items;
  console.log("companyInfoCoreArray", JSON.stringify(companyInfoCoreArray));
  if (+companyInfoCore.statusCode === 200 && companyInfoCoreArray.length) {
    const deleteCompanyResponse = await deleteCompanyMgmt({
      pathParameters: recordObj,
    });
    console.log("deleteCompanyResponse", JSON.stringify(deleteCompanyResponse));
    deleteResultArray.push([
      { company: JSON.parse(deleteCompanyResponse.body) },
    ]);
  }

  // delete team member for company
  const teamMemberResponse = await getApplTeamMembers({
    pathParameters: recordObj,
  });
  const teamMemberResponseArray = JSON.parse(teamMemberResponse.body);

  if (
    +teamMemberResponse.statusCode === 200 &&
    teamMemberResponseArray.length
  ) {
    const deleteTeamMemberResponse = await deleteAllTeamMemberForCompany(
      teamMemberResponseArray
    );
    deleteResultArray.push(deleteTeamMemberResponse);
  }

  // delete all project code
  const projectCodeResponse = await getProjectCodes({
    pathParameters: recordObj,
  });
  const projectCodeResponseArray = JSON.parse(projectCodeResponse.body);

  if (
    +projectCodeResponse.statusCode === 200 &&
    projectCodeResponseArray.length
  ) {
    const deleteProjectResponse = await deleteAllProjectForCompany(
      projectCodeResponseArray
    );
    deleteResultArray.push(deleteProjectResponse);
  }

  // delete timesheet
  const timesheetResponse = await getTimeSheetsForCompany({
    pathParameters: recordObj,
  });
  const timesheetResponseArray = JSON.parse(timesheetResponse.body);

  if (+timesheetResponse.statusCode === 200 && timesheetResponseArray.length) {
    const deleteTimeSheetResponse = await deleteAllTimeSheetForCompany(
      timesheetResponseArray
    );
    deleteResultArray.push(deleteTimeSheetResponse);
  }

  // delete client
  const clientResponse = await getClients({
    pathParameters: { ...recordObj },
  });

  console.log("clientResponse", JSON.stringify(clientResponse));
  const clientResponseArray = JSON.parse(clientResponse.body);

  if (+clientResponse.statusCode === 200 && clientResponseArray.length) {
    const deleteClientResponse = await deleteAllClientForCompany(
      clientResponseArray
    );
    deleteResultArray.push(deleteClientResponse);
  }

  // delete vendor
  const vendorResponse = await getVendors({
    pathParameters: { ...recordObj },
  });
  const vendorResponseArray = JSON.parse(vendorResponse.body);

  if (+vendorResponse.statusCode === 200 && vendorResponseArray.length) {
    const deleteVendorResponse = await deleteAllVendorForCompany(
      vendorResponseArray
    );
    deleteResultArray.push(deleteVendorResponse);
  }

  // delete department
  const departmentResponse = await getCompanyDeptMgmts({
    pathParameters: { ...recordObj },
  });

  console.log("departmentResponse", JSON.stringify(departmentResponse));
  const departmentResponseArray = JSON.parse(departmentResponse.body);

  console.log(
    "departmentResponseArray",
    JSON.stringify(departmentResponseArray)
  );
  if (
    +departmentResponse.statusCode === 200 &&
    departmentResponseArray.length
  ) {
    const deleteDepartmentResponse = await deleteAllDepartmentForCompany(
      departmentResponseArray
    );
    console.log(
      "deleteDepartmentResponse",
      JSON.stringify(deleteDepartmentResponse)
    );

    deleteResultArray.push(deleteDepartmentResponse);
  }

  // delete application
  const applicationResponse = await getAllCompanyDeptAppls({
    pathParameters: { ...recordObj },
  });
  const applicationResponseArray = JSON.parse(applicationResponse.body);

  if (
    +applicationResponse.statusCode === 200 &&
    applicationResponseArray.length
  ) {
    const deleteApplicationResponse = await deleteAllApplicationForCompany(
      applicationResponseArray
    );
    deleteResultArray.push(deleteApplicationResponse);
  }

  // delete assignment
  const assignmentResponse = await getAssignmentForCompany({
    pathParameters: { ...recordObj },
  });
  const assignmentResponseArray = JSON.parse(assignmentResponse.body);

  if (
    +assignmentResponse.statusCode === 200 &&
    assignmentResponseArray.length
  ) {
    const deleteAssignmentResponse = await deleteAllAssignmentForCompany(
      assignmentResponseArray
    );
    deleteResultArray.push(deleteAssignmentResponse);
  }

  // delete application role
  const applRoleResponse = await getApplRoles({
    pathParameters: { ...recordObj },
  });

  console.log("applRoleResponse", JSON.stringify(applRoleResponse));
  const applRoleResponseArray = JSON.parse(applRoleResponse.body);
  console.log("applRoleResponseArray", JSON.stringify(applRoleResponseArray));

  if (+applRoleResponse.statusCode === 200 && applRoleResponseArray.length) {
    const deleteApplRoleResponse = await deleteAllApplRoleForCompany(
      applRoleResponseArray
    );
    console.log(
      "deleteApplRoleResponse",
      JSON.stringify(deleteApplRoleResponse)
    );
    deleteResultArray.push(deleteApplRoleResponse);
  }

  // delete task category
  const taskCategoryResponse = await getApplicationCategorys({
    pathParameters: { ...recordObj },
  });

  console.log("taskCategoryResponse", JSON.stringify(taskCategoryResponse));
  const taskCategoryResponseArray = JSON.parse(taskCategoryResponse.body);

  if (
    +taskCategoryResponse.statusCode === 200 &&
    taskCategoryResponseArray.length
  ) {
    const deleteTaskCategoryResponse = await deleteAllTaskCategoryForCompany(
      taskCategoryResponseArray
    );
    deleteResultArray.push(deleteTaskCategoryResponse);
  }

  // delete authentication roles
  const authRoleResponse = await getAuthRoles({
    pathParameters: { ...recordObj },
  });

  console.log("authRoleResponse", JSON.stringify(authRoleResponse));
  const authRoleResponseArray = JSON.parse(authRoleResponse.body);
  console.log("authRoleResponseArray", JSON.stringify(authRoleResponseArray));

  if (+authRoleResponse.statusCode === 200 && authRoleResponseArray.length) {
    const deleteAuthRoleResponse = await deleteAllAuthRoleForCompany(
      authRoleResponseArray
    );
    console.log(
      "deleteAuthRoleResponse",
      JSON.stringify(deleteAuthRoleResponse)
    );

    deleteResultArray.push(deleteAuthRoleResponse);
  }

  // delete auth screen mapping
  const authScrnMappingResponse = await getAuthScrnMappings({
    pathParameters: { ...recordObj },
  });

  console.log(
    "AuthScrnMappingResponse",
    JSON.stringify(authScrnMappingResponse)
  );
  const authScrnMappingResponseArray = JSON.parse(authScrnMappingResponse.body);
  console.log(
    "authScrnMappingResponseArray",
    JSON.stringify(authScrnMappingResponseArray)
  );
  if (
    +authScrnMappingResponse.statusCode === 200 &&
    authScrnMappingResponseArray.length
  ) {
    const deleteAuthScrnMappingResponse =
      await deleteAllAuthScreenMappingForCompany(authScrnMappingResponseArray);

    console.log(
      "deleteAuthScrnMappingResponse",
      JSON.stringify(deleteAuthScrnMappingResponse)
    );
    deleteResultArray.push(deleteAuthScrnMappingResponse);
  }

  // delete auth screen
  const authScrnResponse = await getAuthScrns({
    pathParameters: { ...recordObj },
  });

  console.log("authScrnResponse", JSON.stringify(authScrnResponse));
  const authScrnResponseArray = JSON.parse(authScrnResponse.body);

  if (+authScrnResponse.statusCode === 200 && authScrnResponseArray.length) {
    const deleteAuthScrnResponse = await deleteAllAuthScreenForCompany(
      authScrnResponseArray
    );
    deleteResultArray.push(deleteAuthScrnResponse);
  }

  return apiResponse(deleteResultArray);
};

const deleteAllProjectForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteProjectCode({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Project: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllTimeSheetForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteTimeSheet({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ TimeSheet: JSON.parse(deleteResponse.body) });

    // delete timesheet details inside timesheet
    const timesheetDetalsResponse = await getTimeSheetDetails({
      pathParameters: { ...array[i] },
    });
    const timesheetDetailsResponseArray = JSON.parse(
      timesheetDetalsResponse.body
    );

    if (
      +timesheetDetalsResponse.statusCode === 200 &&
      timesheetDetailsResponseArray.length
    ) {
      const deleteTimesheetDetailsResponse = await deleteAllTsDetailsForCompany(
        timesheetDetailsResponseArray
      );
      deleteResultObj.push(deleteTimesheetDetailsResponse);
    }
  }
};

const deleteAllTsDetailsForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteTimeSheetDetails({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ TsDetails: JSON.parse(deleteResponse.body) });
  }

  return deleteResultObj;
};

const deleteAllClientForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteClient({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Client: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllVendorForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteVendor({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Vendor: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllDepartmentForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteCompanyDeptMgmt({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Department: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllApplicationForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteDeptApplMgmt({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Application: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllAssignmentForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteApplTeamMemberAssignment({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ Assignment: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllApplRoleForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteApplRole({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ applsRole: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllTaskCategoryForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteApplicationCategory({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ category: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllAuthRoleForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteAuthRole({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ authRole: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllAuthScreenMappingForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteAuthScrnMapping({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ AuthScrnMapping: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllAuthScreenForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteAuthScrn({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ AuthScreen: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};

const deleteAllTeamMemberForCompany = async (array) => {
  const deleteResultObj = [];
  for (let i = 0; i < array.length; i++) {
    const deleteResponse = await deleteApplTeamMember({
      pathParameters: {
        ...array[i],
      },
    });
    deleteResultObj.push({ TeamMember: JSON.parse(deleteResponse.body) });
  }
  return deleteResultObj;
};
