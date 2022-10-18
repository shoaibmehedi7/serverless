import { expiryDate } from "commons/constants";
import { AppConfig } from "commons/environment/appconfig";
import { apiError, apiResponse } from "commons/http-helpers/api-response";
import {
  addRecord,
  deleteRecord,
  getRecord,
  updateRecord,
} from "commons/utils/dbMgmt";
import { log } from "commons/utils/logger";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "../commons/constants";
import { SNS_ASSIGNMENT_UPDATE } from "../commons/utils/sns/sns";

export const addTeamMemberDetails = async (record) => {
  let recordObj = JSON.parse(record["body"]);

  let requiredFields = ["companyId"];
  recordObj.expiryDate = expiryDate();
  recordObj.teamMemberDetailsId = uuidv4();

  //get project
  let projectInfo = await getProjectCodeCore(recordObj);
  console.log("projectInfo" + projectInfo);
  if (projectInfo.statusCode === "200" && projectInfo.body.Items[0]) {
    recordObj.projectInfo = projectInfo.body.Items[0];
  }

  let addResponse = await addRecord(
    recordObj,
    requiredFields,
    AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR
  );
  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getTeamMemberDetailsCore(recordObj);
    console.log(
      `addTeamMemberDetails getResponse:: ${getResponse.body.Items[0]}`
    );

    const resData = getResponse.body.Items[0];

    console.log("addTeamMemberDetails after add clietn info" + resData);

    //drop asynchronous message
    await SNS_ASSIGNMENT_UPDATE({
      teamMemberId: resData.teamMemberId,
      creationDate: resData.creationDate,
      eventCode: "ASSIGNMENT_UPDATE",
      companyId: resData.companyId,
    });
    return apiResponse(resData);
  } else {
    return apiError(500, addResponse);
  }
};

export const getClientCore = async (recordObj) => {
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_CLIENT,
    IndexName: "LSI_clientId",
    KeyConditionExpression: "companyId = :companyId and clientId=:clientId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":clientId": recordObj.clientId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getClient  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getVendorCore = async (recordObj) => {
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_VENDOR,
    IndexName: "LSI_vendorId",
    KeyConditionExpression: "companyId = :companyId and vendorId=:vendorId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":vendorId": recordObj.vendorId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getVendor  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getProjectCodeCore = async (recordObj) => {
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_PROJECT_CODE,
    IndexName: "LSI_projectCodeId",
    KeyConditionExpression:
      "companyId = :companyId and projectCodeId=:projectCodeId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":projectCodeId": recordObj.projectCodeId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getProjectCode  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getTeamMembersForClient = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.clientId = record.pathParameters.clientId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    IndexName: "LSI_clientId",
    KeyConditionExpression: "companyId = :companyId and clientId=:clientId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":clientId": recordObj.clientId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getTeamMembersForClient  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getTeamMembersForVendor = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.vendorId = record.pathParameters.vendorId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    IndexName: "LSI_vendorId",
    KeyConditionExpression: "companyId = :companyId and vendorId=:vendorId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":vendorId": recordObj.vendorId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getTeamMembersForVendorId  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getTeamMemberDetails = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.teamMemberId = record.pathParameters.teamMemberId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression:
      "companyId = :companyId and teamMemberId=:teamMemberId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":teamMemberId": recordObj.teamMemberId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getTeamMemberDetails  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getAssignmentForCompany = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression: "companyId = :companyId ",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };

  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(
    `getTeamMemberDetailsForCompany  response=> ${JSON.stringify(response)}`
  );

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const updateApplTeamMemberAssignment = async (record) => {
  log.debug(`updateApplTeamMemberAssignment -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getTeamMemberDetailsCore(recordObj);
  let requiredFileds = ["companyId", "teamMemberDetailsId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(
    `updateApplTeamMemberAssignment keyObj -> ${JSON.stringify(keyObj)}`
  );
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteApplTeamMemberAssignment = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.teamMemberDetailsId = record.pathParameters.teamMemberDetailsId;
  let requiredFileds = ["companyId", "teamMemberDetailsId"];
  let deletMemberHashDataRes = {};
  if (recordObj.companyId != null && recordObj.teamMemberDetailsId != null) {
    let getResponse = await getTeamMemberDetailsCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
      keyObj
    );
    let response = { body: "DELETE_SUCCESS" };
    return apiResponse(response);
  } else {
    log.debug(`Required data is missing`);
    let errorMsg = deletMemberHashDataRes;
    let response = {
      body: "DELETE_FAILED",
      description: errorMsg,
      statusCode: "501",
    };

    return response;
  }
};

export const getTeamMemberDetailsCore = async (recordObj) => {
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    IndexName: "LSI_teamMemberDetailsId",
    KeyConditionExpression:
      "companyId = :companyId and teamMemberDetailsId=:teamMemberDetailsId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":teamMemberDetailsId": recordObj.teamMemberDetailsId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTeamMemberCore  response=> ${JSON.stringify(response)}`);
  return response;
};

export const archieveAssignmentTeamMember = async (record) => {
  log.debug(`archieveAssignmentTeamMember -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getTeamMemberDetailsCore(recordObj);
  let requiredFileds = ["companyId", "teamMemberDetailsId", "creationDate"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`archieveAssignmentTeamMember keyObj -> ${JSON.stringify(keyObj)}`);
  recordObj.expiryDate = currentDate();
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const getArchieveAssignmentForCompany = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;

  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR_X_CLIENT_X_VENDOR,
    KeyConditionExpression: "companyId = :companyId ",
    FilterExpression: "expiryDate <> :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(
    `getArchieveAssignmentForCompany  response=> ${JSON.stringify(response)}`
  );

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const assignmentUpdateInfoInOtherCollections = async (record) => {
  let recordObj = JSON.parse(record["Records"][0].Sns.Message);

  console.log(
    "assignmentUpdateInfoInOtherCollections" + JSON.stringify(recordObj)
  );
};

export const processTeamMemberUpdate = async (record) => {
  let recordObj = JSON.parse(record["Records"][0].Sns.Message);
//TODO
  console.log(
    "processTeamMemberUpdate" + JSON.stringify(recordObj)
  );
};

