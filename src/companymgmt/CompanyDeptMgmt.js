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

export const addCompanyDeptMgmt = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  return await addCompanyDeptCore(recordObj);
};

export const addCompanyDeptCore = async (recordObj) => {
  let requiredFileds = ["companyId"];
  recordObj.expiryDate = expiryDate();
  recordObj.companyDeptId = uuidv4();
  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_DEPT_MGMT
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getCompanyDeptMgmtCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateCompanyDeptMgmt = async (record) => {
  log.debug(`updateCompanyDeptMgmt -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getCompanyDeptMgmtCore(recordObj);
  let requiredFileds = ["companyId", "companyDeptId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateCompanyDeptMgmt keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_DEPT_MGMT,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteCompanyDeptMgmt = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.companyDeptId = record.pathParameters.companyDeptId;
  let requiredFileds = ["companyId", "companyDeptId"];
  if (recordObj.companyId != null && recordObj.companyDeptId != null) {
    let getResponse = await getCompanyDeptMgmtCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_DEPT_MGMT,
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

export const getCompanyDeptMgmtCore = async (recordObj) => {
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_DEPT_MGMT,
    IndexName: "LSI_companyDeptId",
    KeyConditionExpression:
      "companyId = :companyId and companyDeptId=:companyDeptId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":companyDeptId": recordObj.companyDeptId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getCompanyDeptMgmt  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getCompanyDeptMgmts = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_DEPT_MGMT,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getCompanyDeptMgmt  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};
