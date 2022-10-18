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

export const addApplicationCategory = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  let requiredFields = ["companyId"];
  recordObj.expiryDate = expiryDate();
  recordObj.applicationCategoryId = uuidv4();
  let addResponse = await addRecord(
    recordObj,
    requiredFields,
    AppConfig.DBT_COMPANY_APPL_CATEGORY
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getApplicationCategoryCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateApplicationCategory = async (record) => {
  log.debug(`updateApplicationCategory -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  log.debug(
    `updateApplicationCategory recordObj -> ${JSON.stringify(recordObj)}`
  );
  let getResponse = await getApplicationCategoryCore(recordObj);
  let requiredFields = ["companyId", "applicationCategoryId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateApplicationCategory keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFields,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_APPL_CATEGORY,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteApplicationCategory = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.applicationCategoryId = record.pathParameters.applicationCategoryId;
  let requiredFields = ["companyId", "applicationCategoryId"];
  if (recordObj.companyId != null && recordObj.applicationCategoryId != null) {
    let getResponse = await getApplicationCategoryCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_APPL_CATEGORY,
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

export const getApplicationCategoryCore = async (recordObj) => {
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_CATEGORY,
    IndexName: "LSI_applicationCategoryId",
    KeyConditionExpression:
      "companyId = :companyId and applicationCategoryId=:applicationCategoryId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":applicationCategoryId": recordObj.applicationCategoryId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getApplicationCategory  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getApplicationCategorys = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_CATEGORY,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getApplicationCategory  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const searchApplicationCategorysByStateCodeAndFein = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.stateCode = record.pathParameters.stateCode;
  recordObj.fein = record.pathParameters.fein;

  let requiredFields = ["companyId", "stateCode", "fein"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_CATEGORY,
    IndexName: "LSI_feinStateCode",
    KeyConditionExpression:
      "companyId = :companyId and feinStateCode= :feinStateCode",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":feinStateCode": recordObj.fein + "_" + recordObj.stateCode,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getClient  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};
