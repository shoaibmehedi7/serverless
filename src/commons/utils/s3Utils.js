import fs from 'fs';
import * as AWS from "aws-sdk";
import { validateRequestFields } from "../utils/validateUtils";

AWS.config.update({region: "us-east-1"});

export const execute = async (bucketName) => {
  let response = {};
  var s3 = new AWS.S3();
  try {
    console.log(`inside s3 creation `);
    var params = {
      Bucket: `jotp-tmpl-${bucketName}`
      
    };
    console.log(`params s3 creation2222 => ${JSON.stringify(params)}`);
    let response = await s3.createBucket(params).promise(); 
    console.log (`response is s3 creation is  =>${response}`)  
  } catch (error) {
    console.log("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const uploadFile = async (uploadParams, file) => {
  let response = {};
  let requiredFileds = ["Bucket", "Key", "ContentType"];

  try {
    const validationResponse = validateRequestFields(uploadParams, requiredFileds);

    if (validationResponse === true) {
      uploadParams.Body = file.data;
      console.log('uploadFile uploadParams ==>', uploadParams);
    
      let s3 = new AWS.S3();
      let res = await s3.upload(uploadParams).promise();
      console.log('upload result ==>', res);

      response = { 'body': 'UPLOAD_SUCCESS', 'statusCode': '200' }
      return response;

    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = { 'body': 'UPLOAD_FAILED', 'description': errorMsg, 'statusCode': '501' };
      return response;
    }

  } catch (error) {
      log.debug(`uploadFile error ===> ${JSON.stringify(error)}`);
      response = { 'body': 'UPLOAD_FAILED', 'description': error, 'statusCode': '500' }
      return response;
  }
}




export const uploadFileData = async (uploadParams, data) => {
  let response = {};
  let requiredFileds = ["Bucket", "Key", "ContentType"];

  try {
    const validationResponse = validateRequestFields(uploadParams, requiredFileds);

    if (validationResponse === true) {
      
      let s3 = new AWS.S3();
      let res = await s3.upload(uploadParams).promise();
      console.log('upload result ==>', res);

      response = { 'body': 'UPLOAD_SUCCESS', 'statusCode': '200' }
      return response;

    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = { 'body': 'UPLOAD_FAILED', 'description': errorMsg, 'statusCode': '501' };
      return response;
    }

  } catch (error) {
      log.debug(`uploadFile error ===> ${JSON.stringify(error)}`);
      response = { 'body': 'UPLOAD_FAILED', 'description': error, 'statusCode': '500' }
      return response;
  }
}