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
  getTimeSheetsForClient,
  updateTimeSheet,
} from "./TimeSheetInTimeSheetMgmt";

export const getClients = async (record) => {
  let recordObj = {};
  recordObj.snrAppsId = record.pathParameters.snrAppsId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["snrAppsId", "companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_CLIENT,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
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

export const getClientsIsCompany = async (record) => {
  let recordObj = {};
  recordObj.snrAppsId = record.pathParameters.snrAppsId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["snrAppsId", "companyId"];
  let params = {
    TableName: AppConfig.TMSHTZ_CLIENT,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate and isVisible =:isVisible",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":isVisible": false,
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

export const updateClient = async (record) => {
  log.debug(`updateClient -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getClientCore(recordObj);
  let stateCodeUpdated = false;
  let feinUpdated = false;
  if (recordObj.stateCode) {
    stateCodeUpdated = true;
  }
  if (recordObj.fein) {
    feinUpdated = true;
  }

  if (stateCodeUpdated && feinUpdated) {
    recordObj.feinStateCode = recordObj.fein + "_" + recordObj.stateCode;
  } else if (stateCodeUpdated && !feinUpdated) {
    recordObj.feinStateCode =
      getResponse.body.Items[0].fein + "_" + recordObj.stateCode;
  } else if (!stateCodeUpdated && feinUpdated) {
    recordObj.feinStateCode =
      recordObj.fein + "_" + getResponse.body.Items[0].stateCode;
  }

  let requiredFields = ["companyId", "clientId"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateClient keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFields,
    pkFieldNm,
    skFieldNm,
    AppConfig.TMSHTZ_CLIENT,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    //drop the message to SNS
    console.log("updateClient updateResponse" + JSON.stringify(updateResponse));
    const timeSheetInfoResponse = await getTimeSheetsForClient({
      pathParameters: {
        ...updateResponse.body.Attributes,
        companyId: recordObj.companyId,
      },
    });

    const timeSheetInfoResponseArray = JSON.parse(timeSheetInfoResponse.body);
    for (let i = 0; i < timeSheetInfoResponseArray.length; i++) {
      console.log(
        "timeSheetInfoResponseArray.length",
        timeSheetInfoResponseArray.length
      );
      if (timeSheetInfoResponseArray[i].clientId === recordObj.clientId) {
        timeSheetInfoResponseArray[i].clientInfo = getResponse.body.Items[0];
        await updateTimeSheet({
          body: JSON.stringify(timeSheetInfoResponseArray[i]),
        });
      }
    }
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
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

export const deleteClient = async (record) => {
  let recordObj = {};

  recordObj.snrAppsId = record.pathParameters.snrAppsId;
  recordObj.clientId = record.pathParameters.clientId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFields = ["snrAppsId", "clientId", "companyId"];
  if (
    recordObj.snrAppsId != null &&
    recordObj.clientId != null &&
    recordObj.companyId != null
  ) {
    let getResponse = await getClientCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.TMSHTZ_CLIENT,
      keyObj
    );

    //await deAssociateClientWithCompany(recordObj);

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
