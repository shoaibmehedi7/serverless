import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, deleteRecord, getRecord, updateRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";



export const addAuthScrn = async (record) => {
    let recordObj = JSON.parse(record["body"]);
    let requiredFields = ["companyId"];
    recordObj.expiryDate = expiryDate();
    recordObj.authScrnId= uuidv4();
    let addResponse = await addRecord(
        recordObj,
      requiredFields,
      AppConfig.CMMN_SCRNS
    );
      
    if (addResponse != null && addResponse.statusCode == "200") {
      let getResponse = await getAuthScrnCore (recordObj);
      console.log(`getResponse:: ${getResponse.body.Items[0]}`);
      return apiResponse(getResponse.body.Items[0]);
    } else {
      return apiError(500, addResponse);
    }
};

export const updateAuthScrn = async (record) => {
    log.debug(
        `updateAuthScrn -> ${JSON.stringify(record)}`
      );
      let recordObj = JSON.parse(record["body"]);
      let getResponse = await getAuthScrnCore (recordObj);
      let requiredFields = ["companyId", "authScrnId"];
      const pkFieldNm = "companyId";
      const skFieldNm = "creationDate";
      let keyObj = {
        companyId: recordObj.companyId,
        creationDate: getResponse.body.Items[0].creationDate
      };
    
      log.debug(
        `updateAuthScrn keyObj -> ${JSON.stringify(keyObj)}`
      );
      let updateResponse = await updateRecord(
        recordObj,
        requiredFields,
        pkFieldNm,
        skFieldNm,
        AppConfig.CMMN_SCRNS,
        keyObj
      );
      if (updateResponse != null && updateResponse.statusCode == "200") {
        return apiResponse(updateResponse);
      } else {
        return apiError(500, updateResponse);
      }
};

export const deleteAuthScrn = async (record) => {
  
    let recordObj = {};

    
    recordObj.companyId=record.pathParameters.companyId;
    recordObj.authScrnId=record.pathParameters.authScrnId;
    let requiredFields = ["companyId", "authScrnId"];
    if (recordObj.companyId!=null && recordObj.authScrnId!=null ) {

      let getResponse = await getAuthScrnCore (recordObj);
        
      let keyObj = {
          companyId: recordObj.companyId,
          creationDate: getResponse.body.Items[0].creationDate
      }
      console.log('keyObj ==>', keyObj)

      let deletMemberHashDataRes = await deleteRecord({}, [], AppConfig.CMMN_SCRNS, keyObj);
   
      let response = { 'body': 'DELETE_SUCCESS' };
      return apiResponse(response);
    } else {
        
            log.debug(`Required data is missing`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        
    }
};

export const getAuthScrnCore = async (recordObj) => {
  
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_SCRNS,
    IndexName: "LSI_authScrnId",
    KeyConditionExpression: 'companyId = :companyId and authScrnId=:authScrnId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':authScrnId':  recordObj.authScrnId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthScrn  response=> ${JSON.stringify(response)}`);
  return response;
};



export const getAuthScrns = async (record) => {
  let recordObj={};
  recordObj.companyId=record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_SCRNS,
    KeyConditionExpression: 'companyId = :companyId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthScrn  response=> ${JSON.stringify(response)}`);
  
  
   
   
  if (response != null && response.statusCode == "200") {
    
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }

};
