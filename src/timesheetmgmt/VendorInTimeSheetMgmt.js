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
import { SNS_UPDATE_VENDOR_TRIGGER } from "../commons/utils/sns/sns";

export const addVendor = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  let requiredFields = ["companyId"];
  recordObj.expiryDate = expiryDate();
  recordObj.vendorId = uuidv4();
  let addResponse = await addRecord(
    recordObj,
    requiredFields,
    AppConfig.TMSHTZ_VENDOR
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getVendorCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateVendor = async (record) => {
  log.debug(`updateVendor -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  log.debug(`updateVendor recordObj -> ${JSON.stringify(recordObj)}`);
  let getResponse = await getVendorCore(recordObj);
  let requiredFields = ["companyId", "vendorId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateVendor keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFields,
    pkFieldNm,
    skFieldNm,
    AppConfig.TMSHTZ_VENDOR,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    console.log("updateResponse success", updateResponse);
    //drop the message to SNS
    await SNS_UPDATE_VENDOR_TRIGGER(recordObj);
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteVendor = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.vendorId = record.pathParameters.vendorId;
  let requiredFields = ["companyId", "vendorId"];
  if (recordObj.companyId != null && recordObj.vendorId != null) {
    let getResponse = await getVendorCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.TMSHTZ_VENDOR,
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

export const getVendors = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_VENDOR,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getVendor  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const searchVendorsByStateCodeAndFein = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.stateCode = record.pathParameters.stateCode;
  recordObj.fein = record.pathParameters.fein;

  let requiredFields = ["companyId", "stateCode", "fein"];
  let params = {
    TableName: AppConfig.TMSHTZ_VENDOR,
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

export const updateVendorInfoInOtherCollections = async (record) => {
  let recordObj = JSON.parse(record["Records"][0].Sns.Message);
  console.log("updateVendorInfoInOtherCollections" + recordObj);
};
