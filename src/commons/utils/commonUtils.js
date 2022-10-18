
import { log } from './logger';


export const wrapWithBodyTag = (record) => {
    let response = { "body": record };
    log.debug(`wrapWithBodyTag=>00000`);
    log.debug(`wrapWithBodyTag=>${JSON.stringify(response)}`);
    log.debug(`wrapWithBodyTag=>11111`);
    return response;
};

export const generateRandomPIN = () => {
    let rand = 100000 + Math.floor(Math.random() * 900000);
    return Math.floor(rand);
}


export const getMomentTimeDiffFromNow = (date2) => {
    log.debug(`date1111111111111111111111111111111=>2222`);
    var date1 = moment().toDate();
    log.debug(`date1111111111111111111111111111111=>`);
    log.debug(`date1111111111111111133334444444444411111111111111=>${date1}`);

    var diff = date2.diff(date1);
    log.debug(`diff=>${diff}`);
    return diff;
}

export const  replaceAll=(string, search, replace) =>{
    return string.split(search).join(replace);
  }
  

export const getSecuredChnlVal = (requestObj) => {
    log.debug(`requestObj.channelValue===>${requestObj.channelValue}`);
    if (requestObj.channelValue) {
        let channelVal = requestObj.channelValue;
        var isEmail = channelVal.includes("@");
        if (!isEmail) {
            return getSecuredPhoneVal(channelVal);
        } else {
            return getSecuredEmailVal(channelVal);
        }


    }


}


export const getSecuredChnlValOnly = (channelValue) => {
    log.debug(`requestObj.channelValue===>${channelValue}`);
    if (channelValue) {
        var isEmail = channelValue.includes("@");
        if (!isEmail) {
            return getSecuredPhoneVal(channelValue);
        } else {
            return getSecuredEmailVal(channelValue);
        }


    }


}


export const getSecuredPhoneVal = (phoneNumber) => {
    log.debug(`phoneNumber===>${phoneNumber}`);
    let init4Number = phoneNumber.substring(0, 4);
    let lastNumber = phoneNumber.charAt(phoneNumber.length - 1);
    let finalNumber = init4Number + "********" + lastNumber;
    log.debug(`finalNumbere===>${finalNumber}`);
    return finalNumber;


}

export const getSecuredEmailVal = (emailAddress) => {
    log.debug(`emailAddress===>${emailAddress}`);
    let emailVal = "";
    let domainName = "";
    let domainParent = "";
    emailVal = emailAddress.substring(0, emailAddress.indexOf("@"));
    let completeDomainName = emailAddress.substring(emailAddress.indexOf("@") + 1, emailAddress.length);
    domainName = completeDomainName.substring(0, completeDomainName.lastIndexOf("."));
    domainParent = completeDomainName.substring(completeDomainName.lastIndexOf(".") + 1, completeDomainName.length);
    let hiddenEmailVal = "";
    if (emailVal.length > 2) {
        hiddenEmailVal = emailVal.substring(0, 2) + "**************" + emailVal.charAt(emailVal.length - 1);
    } else {
        hiddenEmailVal = emailVal.substring(0, 1) + "**************" + emailVal.charAt(emailVal.length - 1);
    }
    let hiddenDomainVal = "";
    if (domainName.length > 2) {
        hiddenDomainVal = domainName.substring(0, 2) + "***" + domainName.charAt(domainName.length - 1);
    } else {
        hiddenDomainVal = domainName.substring(0, 1) + "***" + domainName.charAt(domainName.length - 1);
    }

    log.debug(`hiddenEmailVal===>${hiddenEmailVal}`);
    return hiddenEmailVal + "@" + hiddenDomainVal + "." + domainParent



}