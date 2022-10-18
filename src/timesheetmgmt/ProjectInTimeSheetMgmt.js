import { currentDate, expiryDate } from "../commons/constants";
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

export const getProjectCodes = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_PROJECT_CODE,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getProjectCode  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const deleteProjectCode = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.projectCodeId = record.pathParameters.projectCodeId;
  let requiredFields = ["companyId", "projectCodeId"];
  if (recordObj.companyId != null && recordObj.projectCodeId != null) {
    let getResponse = await getProjectCodeCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.TMSHTZ_PROJECT_CODE,
      keyObj
    );

    let response = { body: "DELETE_SUCCESS" };
    return apiResponse(response);
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
