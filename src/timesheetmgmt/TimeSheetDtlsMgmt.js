import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { addRecord, deleteRecord, getRecord, updateRecord } from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";



export const addTimeSheetDetails = async (record) => {
    let recordObj = JSON.parse(record["body"]);
    let requiredFields = ["teamMemberId","timeSheetId"];
    recordObj.expiryDate = expiryDate();
    recordObj.timeSheetDetailsId= uuidv4();
    let addResponse = await addRecord(
        recordObj,
      requiredFields,
      AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS
    );
      
    if (addResponse != null && addResponse.statusCode == "200") {
      let getResponse = await getTimeSheetDetailsCore (recordObj);
      console.log(`getResponse:: ${getResponse.body.Items[0]}`);
      return apiResponse(getResponse.body.Items[0]);
    } else {
      return apiError(500, addResponse);
    }
};

export const updateTimeSheetDetails = async (record) => {
    log.debug(
        `updateTimeSheet -> ${JSON.stringify(record)}`
      );
      let recordObj = JSON.parse(record["body"]);
      let getResponse = await getTimeSheetDetailsCore (recordObj);
      let requiredFields = ["timeSheetDetailsId", "timeSheetId"];
      const pkFieldNm = "timeSheetId";
      const skFieldNm = "creationDate";
      let keyObj = {
        timeSheetId: recordObj.timeSheetId,
        creationDate: getResponse.body.Items[0].creationDate
      };
    
      log.debug(
        `updateTimeSheet keyObj -> ${JSON.stringify(keyObj)}`
      );
      let updateResponse = await updateRecord(
        recordObj,
        requiredFields,
        pkFieldNm,
        skFieldNm,
        AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS,
        keyObj
      );
      if (updateResponse != null && updateResponse.statusCode == "200") {
        return apiResponse(updateResponse);
      } else {
        return apiError(500, updateResponse);
      }
};

export const deleteTimeSheetDetails = async (record) => {
  
    let recordObj = {};

    
    recordObj.timeSheetId=record.pathParameters.timeSheetId;
    recordObj.timeSheetDetailsId=record.pathParameters.timeSheetDetailsId;
    let requiredFields = ["timeSheetId", "timeSheetDetailsId"];
    if (recordObj.timeSheetId!=null && recordObj.timeSheetDetailsId!=null ) {

      let getResponse = await getTimeSheetDetailsCore (recordObj);
        
      let keyObj = {
          teamMemberId: recordObj.timeSheetId,
          creationDate: getResponse.body.Items[0].creationDate
      }
      console.log('keyObj ==>', keyObj)

      let deletMemberHashDataRes = await deleteRecord({}, [], AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS, keyObj);
   
      let response = { 'body': 'DELETE_SUCCESS' };
      return apiResponse(response);
    } else {
        
            log.debug(`Required data is missing`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        
    }
};

export const getTimeSheetDetailsCore = async (recordObj) => {
  
  let requiredFields = ["timeSheetId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS,
    KeyConditionExpression: 'timeSheetId = :timeSheetId',
    FilterExpression: "expiryDate = :expiryDate and timeSheetDetailsId=:timeSheetDetailsId",
    ExpressionAttributeValues: {
      ':timeSheetId':  recordObj.timeSheetId,
      ':timeSheetDetailsId':  recordObj.timeSheetDetailsId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheet  response=> ${JSON.stringify(response)}`);
  return response;
};



export const getTimeSheetDetails = async (record) => {
  let recordObj={};
  recordObj.timeSheetId=record.pathParameters.timeSheetId;
  let requiredFields = ["timeSheetId"];
  let params = {
    TableName: AppConfig.TMSHTZ_TEAM_MBR_TIMESHEET_DTLS,
    KeyConditionExpression: 'timeSheetId = :timeSheetId',
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ':timeSheetId':  recordObj.timeSheetId,
      ':expiryDate':expiryDate()
    }

  };
  let response = await getRecord(recordObj, requiredFields, params);
  log.debug(`getTimeSheet  response=> ${JSON.stringify(response)}`);
  
  
   
   
  if (response != null && response.statusCode == "200") {
    
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }

};
