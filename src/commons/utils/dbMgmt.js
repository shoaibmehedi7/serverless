import { log } from '../../commons/utils/logger';
import { AppConfig } from '../../commons/environment/appconfig';
import { validateRequestFields } from "../utils/validateUtils";
import { getDbClient } from "../utils/dbConnector";
import { getUpdateExpressions } from "../utils/updateExpression";
import { currentDateTime, lockExpiryTime } from "../constants";


const docClient = getDbClient();



export const addRecord = async (recordObj, requiredFileds, tableName) => {
    let response = {};
    try {
        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFileds
        );
        if (validationResponse === true) {
            recordObj.creationDate = currentDateTime();
            const params = {
                TableName: tableName,
                Item: recordObj,
            };

            log.debug(`params -> ${JSON.stringify(params)}`);
            const data = await docClient.put(params).promise();

        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'INSERT_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }
    } catch (error) {
        log.debug(`addNewReceiverInfo|error -> ${JSON.stringify(error)}`);
        response = { 'body': 'INSERT_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
    response = { 'body': 'INSERT_SUCCESS', 'statusCode': '200' }
    log.debug(`response ${JSON.stringify(response)}`)
    return response;

};

export const addBulkRecord = async (recordObj) => {
    log.debug(`recordObj...${recordObj}`);
    
    let response = {};
    try {
           const data = await docClient.batchWriteItem(recordObj).promise();

        
    } catch (error) {
        log.debug(`addNewReceiverInfo|error -> ${JSON.stringify(error)}`);
        response = { 'body': 'INSERT_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
    response = { 'body': 'INSERT_SUCCESS', 'statusCode': '200' }
    log.debug(`response ${JSON.stringify(response)}`)
    return response;

};


export async function updateRecord(recordObj, requiredFileds, pkFieldNm, skFieldNm, tableName, keyObj) {
    let response= {};
    try {
        console.log("....requiredFileds.....");
        console.log(JSON.stringify(requiredFileds));

        console.log("....recordObj.....");
        console.log(JSON.stringify(recordObj));
        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFileds
        );
        if (validationResponse === true) {

            recordObj.lastUpdatedDate = currentDateTime();
            let updateExpressionInfo = getUpdateExpressions(
                recordObj,
                pkFieldNm,
                skFieldNm
            );
            const params = {
                TableName: tableName,
                // Key: {
                //   otpCampaignId: recordObj.otpCampaignId,
                //   journeyCode: recordObj.journeyCode,
                // },
                Key: keyObj,
                UpdateExpression: updateExpressionInfo.updateExpression,
                ExpressionAttributeValues: {
                    ...updateExpressionInfo.expressionAttributeValues,
                },
                ReturnValues: "UPDATED_NEW",
            };

            console.log(`params -> ${JSON.stringify(params)}`);
            const data = await docClient.update(params).promise();
            console.log(`data is ${JSON.stringify(data)}`);
            
            response = { 'body': data, 'statusCode': '200' }
            
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'UPDATE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`updateRecord| ${tableName} error -> ${JSON.stringify(error)}`);
        response = { 'body': 'UPDATE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
};



export async function getRecord(recordObj,requiredFileds,params) {
    let response= {};
    try {

        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFileds
        );
        log.debug(`validationResponse -> ${validationResponse}`);
        if (validationResponse === true) {
            log.debug(`params -> ${JSON.stringify(params)}`);
            let dataResponse = await docClient.query(params).promise();
            log.debug(`data is waitin.....`);
            log.debug(`data is ${JSON.stringify(dataResponse)}`);
            response = { 'body': dataResponse, 'statusCode': '200' };
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'GET_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;
        }
} catch (error) {
    log.debug("here............errorrrrrr 3333333333333");
    log.debug(`here............errorrrrrr ${error}`);
    log.debug(`getRecord|  error -> ${JSON.stringify(error)}`);
    response = { 'body': 'GET_FAILED', 'description': error, 'statusCode': '500' }
    return response;
    //throw new Error(error);
}
}

export async function scanRecord(recordObj,requiredFileds,params) {
    let response= {};
    try {

        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFileds
        );
        if (validationResponse === true) {
            log.debug(`params -> ${JSON.stringify(params)}`);
            let dataResponse = await docClient.scan(params).promise();
            log.debug(`data is ${JSON.stringify(dataResponse)}`);
            response = { 'body': dataResponse, 'statusCode': '200' };
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'GET_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;
        }
    } catch (error) {
        log.debug("here............errorrrrrr 3333333333333");
        log.debug(`here............errorrrrrr ${error}`);
        log.debug(`getRecord|  error -> ${JSON.stringify(error)}`);
        response = { 'body': 'GET_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export const deleteRecord = async(recordObj, requiredFileds, tableName, keyObj, conditionExpression, expressionAttributeValues) => {
    let response= {};
    try {

        const validationResponse = validateRequestFields(recordObj, requiredFileds);

        if (validationResponse === true) {
            const params = {
                TableName: tableName,
                Key: keyObj
            };

            if (conditionExpression != null && expressionAttributeValues != null) {
                params.ConditionExpression = conditionExpression;
                params.ExpressionAttributeValues = expressionAttributeValues;
            }
            console.log(`delete params -> ${JSON.stringify(params)}`);

            const data = await docClient.delete(params).promise();
            console.log(`delete response is ${JSON.stringify(data)}`);
            
            response = { 'body': 'DELETE_SUCCESS', 'statusCode': '200' }
            
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`deleteRecord| ${tableName} error -> ${JSON.stringify(error)}`);
        response = { 'body': 'DELETE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}