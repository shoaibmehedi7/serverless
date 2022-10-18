import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, deleteRecord, getRecord, updateRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";
import {getCompanyDeptMgmts} from '../companymgmt/CompanyDeptMgmt';


export const addApplRole = async (record) => {
    let recordObj = JSON.parse(record["body"]);
   return await addApplRoleCore(recordObj);
};

export const addApplRoleCore = async (recordObj) => {
  let requiredFileds = ["companyId"];
  recordObj.expiryDate = expiryDate();
  recordObj.applRoleId= uuidv4();
  let addResponse = await addRecord(
      recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_APPL_ROLE_MGMT
  );
    
  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getApplRoleCore (recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateApplRole = async (record) => {
    log.debug(
        `updateApplRole -> ${JSON.stringify(record)}`
      );
      let recordObj = JSON.parse(record["body"]);
      let getResponse = await getApplRoleCore (recordObj);
      let requiredFileds = ["companyId"];
      const pkFieldNm = "companyId";
      const skFieldNm = "creationDate";
      let keyObj = {
        companyId: recordObj.companyId,
        creationDate: getResponse.body.Items[0].creationDate
      };
    
      log.debug(
        `updateApplRole keyObj -> ${JSON.stringify(keyObj)}`
      );
      let updateResponse = await updateRecord(
        recordObj,
        requiredFileds,
        pkFieldNm,
        skFieldNm,
        AppConfig.DBT_COMPANY_APPL_ROLE_MGMT,
        keyObj
      );
      if (updateResponse != null && updateResponse.statusCode == "200") {
        return apiResponse(updateResponse);
      } else {
        return apiError(500, updateResponse);
      }
};

export const deleteApplRole = async (record) => {
  
    let recordObj = {};

    
    recordObj.companyId=record.pathParameters.companyId;
    recordObj.applRoleId=record.pathParameters.applRoleId;
    let requiredFileds = ["companyId", "applRoleId"];
    if (recordObj.companyId!=null && recordObj.applRoleId!=null ) {

      let getResponse = await getApplRoleCore (recordObj);
        
      let keyObj = {
        companyId: recordObj.companyId,
          creationDate: getResponse.body.Items[0].creationDate
      }
      console.log('keyObj ==>', keyObj)

      let deletMemberHashDataRes = await deleteRecord({}, [], AppConfig.DBT_COMPANY_APPL_ROLE_MGMT, keyObj);
   
      let response = { 'body': 'DELETE_SUCCESS' };
      return apiResponse(response);
    } else {
        
            log.debug(`Required data is missing`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        
    }
};

export const getApplRoleCore = async (recordObj) => {
  
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_ROLE_MGMT,
    IndexName: "LSI_applRoleId",
    KeyConditionExpression: 'companyId = :companyId and applRoleId=:applRoleId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':companyId':  recordObj.companyId,
      ':applRoleId':  recordObj.applRoleId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplRole  response=> ${JSON.stringify(response)}`);
  return response;
};

  export const getApplRoles = async (record) => {
    let recordObj={};
    recordObj.companyId=record.pathParameters.companyId;
    let requiredFileds = ["companyId"];
    let params = {
      TableName: AppConfig.DBT_COMPANY_APPL_ROLE_MGMT,
      KeyConditionExpression: 'companyId = :companyId',
      FilterExpression: "expiryDate = :expiryDate",
      ExpressionAttributeValues: {
        ':companyId':  recordObj.companyId,
        ':expiryDate':expiryDate()
      }

    };
    let response = await getRecord(recordObj, requiredFileds, params);
    log.debug(`getApplRole  response=> ${JSON.stringify(response)}`);
    
    
    
    
    if (response != null && response.statusCode == "200") {
      
      return apiResponse(response.body.Items);
    } else {
      return apiError(500, response);
  }

};
