
import { log } from './logger';

import * as sdk from 'aws-sdk';


const accountSid = "AC627eb74ed910d02c34af1d23fb21dfc0";//process.env.TWILIO_ACCOUNT_SID;
const authToken = "80443f149af1b4089dcde7350b3a870d";//process.env.TWILIO_AUTH_TOKEN;
let clientOptions = { logLevel: 'debug' };
const sns = new sdk.SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });
const client = require('twilio')(accountSid, authToken,clientOptions);


export const  sendPhonePin = async  (phonePinVal,phoneNumber) => {
  log.debug(`sendPhonePin is....${phonePinVal}`);
  log.debug(`phoneNumber is....${phoneNumber}`);
  let params = {
    Message: `${phonePinVal} is your OTP. This OTP will be valid for 10 minutes.`,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'SNR'
        }
    }
};

log.info(`Text Params is ${params}`);
let publishTextPromise
try {
    publishTextPromise = await sns.publish(params).promise();
    log.info(`SNS Text Publish Success `);
    return publishTextPromise;
} catch (err) {
    log.error(`Error occured while SNS Publish Text Message  ${err}`);
    return {errorCode : '900', errorMessage: err}
};
};
