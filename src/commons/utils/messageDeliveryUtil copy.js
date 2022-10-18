
import { log } from './logger';



const accountSid = "AC627eb74ed910d02c34af1d23fb21dfc0";//process.env.TWILIO_ACCOUNT_SID;
const authToken = "80443f149af1b4089dcde7350b3a870d";//process.env.TWILIO_AUTH_TOKEN;
let clientOptions = { logLevel: 'debug' };

const client = require('twilio')(accountSid, authToken,clientOptions);


export const  sendPhonePin = async  (phonePinVal,phoneNumber) => {
  log.debug(`sendPhonePin is....${phonePinVal}`);
  log.debug(`phoneNumber is....${phoneNumber}`);
  try {

  //   client.messages
  // .create({
  //    body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
  //    from: '+14047370316',
  //    to: '+16023451422'
  //  })
  // .then(message => console.log(message.sid))
  // .catch(e => { console.error('!!!!!!!!!!!!!!!!!!!!!!!Got an error:', e.code, e.message); });


  var twilioPromise= client.messages.create({
     body: `${phonePinVal} is your OTP. This OTP will be valid for 10 minutes.`,
     from: '+14047370316',
     to: phoneNumber
   });

   twilioPromise.then(function(message) {
    log.debug(`OTP SENT`);
    log.debug(`msg is------> ${message.sid}`);
    log.debug(`message sent successfully`);
    return true;
}, function(error) {
    console.error('Call failed!  Reason: '+error.message);
    log.debug(`OTP Delivery failed=>${error.message}`);
    return false;
});

//   .then(message => {
//     log.debug(`OTP SENT`);
//     log.debug(`msg is------> ${message.sid}`);
//     log.debug(`message sent successfully`);
//     return true;
// })
//   .catch((error)=> {
//     log.debug(`OTP Delivery failed=>${error}`);
//     return false;
//   }) ;
 
}   catch (error) {
  console.log(`------------------------`);
  console.log(error);
  console.log(`------------------------`);
  return false;
}
};
