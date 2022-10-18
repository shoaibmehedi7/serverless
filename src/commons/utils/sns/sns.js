import * as AWS from "aws-sdk";
import { replaceAll } from "../commonUtils";

import { getSecuredChnlVal, getSecuredChnlValOnly } from "../commonUtils";
import { encrypt } from "../crypto";

AWS.config.update({ region: "us-east-1" });
var sns = new AWS.SNS({ apiVersion: "2010-03-31" });

import { AppConfig } from "../../environment/appconfig";

export const jOtp_deliver_otp = async (obj) => {
  // Create publish parameters
  var params = {
    Message: JSON.stringify(obj),
    TopicArn: AppConfig.SNS_JOTP_DELIVER_OTP,
  };

  let publishTextPromise = await sns.publish(params).promise();
  console.log("jOtp_deliver_otp ===>", publishTextPromise);

  return;
};

export const jOtp_verified_chnl_Val = async (obj) => {
  let localObj = { ...obj };
  localObj.securedChnlVal = getSecuredChnlVal(localObj);
  delete localObj.channelValue;
  delete localObj.transactionId;
  // Create publish parameters
  var params = {
    Message: JSON.stringify(localObj),
    TopicArn: AppConfig.SNS_JOTP_VERIFIED_CHNL_VAL,
  };

  let publishTextPromise = await sns.publish(params).promise();
  console.log("jotp_verified_chnl_Val ===>", publishTextPromise);

  return;
};

export const jOtp_otp_verify_req_rcvd = async (
  request,
  transactionId,
  action,
  otpVal,
  encrypOtpVal
) => {
  let recordLocal = { ...request };
  let recordAsString = JSON.stringify(recordLocal);
  console.log(`otpVal=> ${otpVal}`);
  console.log(`encrypOtpVal=> ${encrypOtpVal}`);
  console.log(`recordAsString=> ${recordAsString}`);

  const replaceChnlValRecord = replaceAll(recordAsString, otpVal, encrypOtpVal);
  console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  recordLocal = JSON.parse(replaceChnlValRecord);
  recordLocal.action = action;

  recordLocal.encrypOtpVal = encrypOtpVal;
  recordLocal.transactionId = transactionId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_RECEIVED_VERIFY_REQUEST,
  };

  let publishTextPromise = await sns.publish(params).promise();
  console.log("jOtp_otp_verify_req_rcvd ===>", publishTextPromise);

  return;
};

export const jOtp_otp_req_rcvd = async (
  record,
  channelVal,
  action,
  otpCampaignId,
  channel,
  transactionId
) => {
  let recordLocal = { ...record };
  console.log(`jOtp_otp_req_rcvd==channelVal ===> ${channelVal}`);
  let securedChnlVal = getSecuredChnlValOnly(channelVal);
  let encryptedChnlVal = await encrypt(channelVal);
  console.log(`encryptedChnlVal ===> ${encryptedChnlVal.hash}`);
  recordLocal.internalChnlVal = encryptedChnlVal.hash;
  recordLocal.securedChnlVal = securedChnlVal;
  let recordAsString = JSON.stringify(recordLocal);
  console.log(`jOtp_lock_unlock_history....1 ${channelVal}`);
  console.log(`securedChnlVal....1 ${securedChnlVal}`);
  console.log(`recordAsString=> ${recordAsString}`);
  const replaceChnlValRecord = replaceAll(
    recordAsString,
    channelVal,
    securedChnlVal
  );
  console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  recordLocal = JSON.parse(replaceChnlValRecord);
  recordLocal.action = action;
  recordLocal.otpCampaignId = otpCampaignId;
  recordLocal.channel = channel;
  recordLocal.transactionId = transactionId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_RECEIVED_REQUEST,
  };

  let publishTextPromise = await sns.publish(params).promise();
  console.log("jOtp_otp_req_rcvd ===>", publishTextPromise);

  return;
};

// function replaceAll(string, search, replace) {
//   return string.split(search).join(replace);
// }

export const jOtp_lock_unlock_history = async (
  recordLocal
  // ,
  // channelVal,
  // securedChnlVal,
  // action,
  // otpCampaignId
) => {
  // let recordLocal = { ...record };
  // if (recordLocal.internalChnlVal == null) {
  //   let encryptedChnlVal = await encrypt(channelVal);
  //   console.log(`encryptedChnlVal ===> ${encryptedChnlVal.hash}`);
  //   recordLocal._internalChnlVal = encryptedChnlVal.hash;
  // } else {
  //   recordLocal._internalChnlVal = recordLocal.internalChnlVal;
  // }

  // let recordAsString = JSON.stringify(recordLocal);
  // console.log(`jOtp_lock_unlock_history....1 ${channelVal}`);
  // console.log(`securedChnlVal....1 ${securedChnlVal}`);
  // console.log(`recordAsString=> ${recordAsString}`);
  // const replaceChnlValRecord = replaceAll(
  //   recordAsString,
  //   channelVal,
  //   securedChnlVal
  // );
  // console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  // recordLocal = JSON.parse(replaceChnlValRecord);
  // recordLocal._action = action;
  // recordLocal._otpCampaignId = otpCampaignId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_LOCK_UNLOCK_HISTORY,
  };
  console.log(
    "publishTextPromise SNS_JOTP_LOCK_UNLOCK_HISTORY  params ===>",
    params
  );

  let publishTextPromise = await sns.publish(params).promise();
  console.log(
    "publishTextPromise SNS_JOTP_LOCK_UNLOCK_HISTORY ===>",
    publishTextPromise
  );

  return;
};

export const jOtp_store_journey = async (screenRoleMappings) => {
  var params = {
    Message: JSON.stringify(screenRoleMappings),
    TopicArn: AppConfig.SNS_JOTP_JOURNEY,
  };
  console.log("publishTextPromise SNS_JOTP_JOURNEY  params ===>", params);

  let publishTextPromise = await sns.publish(params).promise();
  console.log("publishTextPromise SNS_JOTP_JOURNEY ===>", publishTextPromise);

  return;
};

export const SNS_JOTP_SYSTEM_TRIGGER = async (recordLocal) => {
  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_TIMELNK_SCRN_RL_MPNG,
  };
  console.log(
    "publishTextPromise SNS_TIMELNK_SCRN_RL_MPNG  params ===>",
    params
  );

  let publishTextPromise = await sns.publish(params).promise();
  console.log(
    "publishTextPromise SNS_TIMELNK_SCRN_RL_MPNG ===>",
    publishTextPromise
  );

  return;
};

export const SNS_ASSIGNMENT_UPDATE = async (recordLocal) => {
  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_ASSIGNMENT_UPDATE,
  };
  console.log("publishTextPromise SNS_ASSIGNMENT_UPDATE  params ===>", params);

  let publishTextPromise = await sns.publish(params).promise();
  console.log(
    "publishTextPromise SNS_ASSIGNMENT_UPDATE ===>",
    publishTextPromise
  );

  return;
};

export const SNS_TEAM_MEMBER_UPDATE = async (recordLocal) => {
  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_TEAM_MEMBER_UPDATE,
  };
  console.log("publishTextPromise SNS_TEAM_MEMBER_UPDATE  params ===>", params);

  let publishTextPromise = await sns.publish(params).promise();
  console.log(
    "publishTextPromise SNS_TEAM_MEMBER_UPDATE ===>",
    publishTextPromise
  );

  return;
};
