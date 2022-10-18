import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, deleteRecord, getRecord, updateRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";



export const addAuthScrnMapping = async (record) => {
    let recordObj = JSON.parse(record["body"]);
    let requiredFields = ["companyId"];
    recordObj.expiryDate = expiryDate();
    recordObj.authScrnMappingId= uuidv4();
    let addResponse = await addRecord(
        recordObj,
      requiredFields,
      AppConfig.CMMN_AUTHENTICATION_X_SCRNS
    );
      
    if (addResponse != null && addResponse.statusCode == "200") {
      let getResponse = await getAuthScrnMappingCore (recordObj);
      console.log(`getResponse:: ${getResponse.body.Items[0]}`);
      return apiResponse(getResponse.body.Items[0]);
    } else {
      return apiError(500, addResponse);
    }
};

export const updateAuthScrnMapping = async (record) => {
    log.debug(
        `updateAuthScrnMapping -> ${JSON.stringify(record)}`
      );
      let recordObj = JSON.parse(record["body"]);
      let getResponse = await getAuthScrnMappingCore (recordObj);
      let requiredFields = ["companyId", "authScrnMappingId"];
      const pkFieldNm = "companyId";
      const skFieldNm = "creationDate";
      let keyObj = {
        companyId: recordObj.companyId,
        creationDate: getResponse.body.Items[0].creationDate
      };
    
      log.debug(
        `updateAuthScrnMapping keyObj -> ${JSON.stringify(keyObj)}`
      );
      let updateResponse = await updateRecord(
        recordObj,
        requiredFields,
        pkFieldNm,
        skFieldNm,
        AppConfig.CMMN_AUTHENTICATION_X_SCRNS,
        keyObj
      );
      if (updateResponse != null && updateResponse.statusCode == "200") {
        return apiResponse(updateResponse);
      } else {
        return apiError(500, updateResponse);
      }
};

export const deleteAuthScrnMapping = async (record) => {
  
    let recordObj = {};

    
    recordObj.companyId=record.pathParameters.companyId;
    recordObj.authScrnMappingId=record.pathParameters.authScrnMappingId;
    let requiredFields = ["companyId", "authScrnMappingId"];
    if (recordObj.companyId!=null && recordObj.authScrnMappingId!=null ) {

      let getResponse = await getAuthScrnMappingCore (recordObj);
        
      let keyObj = {
          companyId: recordObj.companyId,
          creationDate: getResponse.body.Items[0].creationDate
      }
      console.log('keyObj ==>', keyObj)

      let deletMemberHashDataRes = await deleteRecord({}, [], AppConfig.CMMN_AUTHENTICATION_X_SCRNS, keyObj);
   
      let response = { 'body': 'DELETE_SUCCESS' };
      return apiResponse(response);
    } else {
        
            log.debug(`Required data is missing`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        
    }
};

export const getAuthScrnMappingCore = async (recordObj) => {
  
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_AUTHENTICATION_X_SCRNS,
    IndexName: "LSI_authScrnMappingId",
    KeyConditionExpression: 'companyId = :companyId and authScrnMappingId=:authScrnMappingId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':authScrnMappingId':  recordObj.authScrnMappingId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthScrnMapping  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getAuthScrnMappings = async (record) => {
  let recordObj={};
  recordObj.companyId=record.pathParameters.companyId;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_AUTHENTICATION_X_SCRNS,
    KeyConditionExpression: 'companyId = :companyId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthScrnMapping  response=> ${JSON.stringify(response)}`);
  
  
   
   
  if (response != null && response.statusCode == "200") {
    
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }

};

export const getAuthScrnMappingsForTeamMember = async (record) => {
  let recordObj={};
  recordObj.companyId=record.pathParameters.companyId;
  recordObj.teamMemberId=record.pathParameters.teamMemberId;
  let teamMemberDetails = await getApplTeamMemberCore(recordObj);
  console.log("teamMemberDetails.....");
  console.log(JSON.stringify(teamMemberDetails));
//Get Role for this team member 
  let roleName=teamMemberDetails.authRoleName;
  let requiredFields = ["companyId"];
  let params = {
    TableName: AppConfig.CMMN_AUTHENTICATION_X_SCRNS,
    IndexName:"LSI_roleName",
    KeyConditionExpression: 'companyId = :companyId and roleName=:roleName',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':expiryDate':expiryDate(),
      ':roleName': roleName
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getAuthScrnMapping  response=> ${JSON.stringify(response)}`);
  
  
   
   
  if (response != null && response.statusCode == "200") {
    
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }

};


export const getApplTeamMemberCore = async (recordObj) => {
  
  let requiredFileds = ["teamMemberId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression: 'companyId = :companyId and teamMemberId=:teamMemberId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':teamMemberId':  recordObj.teamMemberId,
      ':companyId':  recordObj.companyId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);
  return response;
};
