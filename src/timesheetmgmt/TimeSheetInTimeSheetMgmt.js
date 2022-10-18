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

export const getTimeSheetsSubmittedForMember = async (record) => {
  console.log("getTimeSheetsSubmittedForMember", record.pathParameters);
  let recordObj = {};
  recordObj.teamMemberId = record.pathParameters.teamMemberId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["teamMemberId", "companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression:
      "teamMemberId = :teamMemberId and companyId =:companyId",
    FilterExpression:
      "expiryDate = :expiryDate and timeSheetStatus=:timeSheetStatus",
    ExpressionAttributeValues: {
      ":teamMemberId": recordObj.teamMemberId,
      ":timeSheetStatus": "SUBMITTED",
      ":expiryDate": expiryDate(),
      ":companyId": recordObj.companyId,
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheet  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getTimeSheetsForClient = async (record) => {
  let recordObj = {};
  recordObj.clientId = record.pathParameters.clientId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId", "clientId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
    IndexName: "LSI_clientId",
    KeyConditionExpression: "companyId = :companyId and clientId =:clientId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":clientId": recordObj.clientId,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheetsForClient  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getTimeSheetsForCompany = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
    KeyConditionExpression: "companyId = :companyId ",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheetsForClient  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const deleteTimeSheet = async (record) => {
  let recordObj = {};

  recordObj.teamMemberId = record.pathParameters.teamMemberId;
  recordObj.timeSheetId = record.pathParameters.timeSheetId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId", "teamMemberId", "timeSheetId"];
  if (
    recordObj.teamMemberId != null &&
    recordObj.timeSheetId != null &&
    recordObj.companyId != null
  ) {
    let getResponse = await getTimeSheetCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
      keyObj
    );

    if (
      deletMemberHashDataRes != null &&
      deletMemberHashDataRes.statusCode == "200"
    ) {
      return apiResponse({ body: "DELETE_SUCCESS" });
    } else {
      return apiError(500, deletMemberHashDataRes);
    }
  } else {
    log.debug(`Required data is missing`);
    let errorMsg = validationResponse;
    response = {
      body: "DELETE_FAILED",
      description: errorMsg,
      statusCode: "501",
    };

    return response;
  }
};

export const updateTimeSheet = async (record) => {
  log.debug(`updateTimeSheet -> ${JSON.stringify(record.body)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getTimeSheetCore(recordObj);
  let requiredFields = ["companyId", "teamMemberId", "timeSheetId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateTimeSheet keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFields,
    pkFieldNm,
    skFieldNm,
    AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const getTimeSheetCore = async (recordObj) => {
  let requiredFields = ["teamMemberId", "companyId", "timeSheetId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET,
    IndexName: "LSI_timeSheetId",
    KeyConditionExpression:
      "companyId =:companyId and timeSheetId=:timeSheetId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":timeSheetId": recordObj.timeSheetId,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheet  response=> ${JSON.stringify(response)}`);
  return response;
};
