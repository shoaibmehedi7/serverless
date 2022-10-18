import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, deleteRecord, getRecord, updateRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";



export const addAuthRole = async (record) => {
    let recordObj = JSON.parse(record["body"]);
    let requiredFields = ["companyId"];
    recordObj.expiryDate = expiryDate();
    recordObj.authRoleId= uuidv4();
    let addResponse = await addRecord(
        recordObj,
      requiredFields,
      AppConfig.CMMN_AUTH_ROLES
    );
      
    if (addResponse != null && addResponse.statusCode == "200") {
      let getResponse = await getAuthRoleCore (recordObj);
      console.log(`getResponse:: ${getResponse.body.Items[0]}`);
      return apiResponse(getResponse.body.Items[0]);
    } else {
      return apiError(500, addResponse);
    }
};

export const updateAuthRole = async (record) => {
    log.debug(
        `updateAuthRole -> ${JSON.stringify(record)}`
      );
      let recordObj = JSON.parse(record["body"]);
      let getResponse = await getAuthRoleCore (recordObj);
      let requiredFields = ["companyId", "authRoleId"];
      const pkFieldNm = "companyId";
      const skFieldNm = "creationDate";
      let keyObj = {
        companyId: recordObj.companyId,
        creationDate: getResponse.body.Items[0].creationDate
      };
    
      log.debug(
        `updateAuthRole keyObj -> ${JSON.stringify(keyObj)}`
      );
      let updateResponse = await updateRecord(
        recordObj,
        requiredFields,
        pkFieldNm,
        skFieldNm,
        AppConfig.CMMN_AUTH_ROLES,
        keyObj
      );
      if (updateResponse != null && updateResponse.statusCode == "200") {
        return apiResponse(updateResponse);
      } else {
        return apiError(500, updateResponse);
      }
};

export const deleteAuthRole = async (record) => {
  
    let recordObj = {};

    
    recordObj.companyId=record.pathParameters.companyId;
    recordObj.authRoleId=record.pathParameters.authRoleId;
    let requiredFields = ["companyId", "authRoleId"];
    if (recordObj.companyId!=null && recordObj.authRoleId!=null ) {

      let getResponse = await getAuthRoleCore (recordObj);
        
      let keyObj = {
          companyId: recordObj.companyId,
          creationDate: getResponse.body.Items[0].creationDate
      }
      console.log('keyObj ==>', keyObj)

      let deletMemberHashDataRes = await deleteRecord({}, [], AppConfig.CMMN_AUTH_ROLES, keyObj);
   
      let response = { 'body': 'DELETE_SUCCESS' };
      return apiResponse(response);
    } else {
        
            log.debug(`Required data is missing`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        
    }
};

export const getAuthRoleCore = async (recordObj) => {
  
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_AUTH_ROLES,
    IndexName: "LSI_authRoleId",
    KeyConditionExpression: 'companyId = :companyId and authRoleId=:authRoleId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':authRoleId':  recordObj.authRoleId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthRole  response=> ${JSON.stringify(response)}`);
  return response;
};



export const getAuthRoles = async (record) => {
  let recordObj={};
  recordObj.companyId=record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_AUTH_ROLES,
    KeyConditionExpression: 'companyId = :companyId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthRole  response=> ${JSON.stringify(response)}`);
  
  
   
   
  if (response != null && response.statusCode == "200") {
    
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }

};
