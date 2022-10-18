import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import {
  addRecord,
  deleteRecord,
  getRecord,
  updateRecord,
} from "../commons/utils/dbMgmt";
import { log } from "../commons/utils/logger";
import { v4 as uuidv4 } from "uuid";
import {
  getClients,
  getClientsIsCompany,
  updateClient,
} from "../timesheetmgmt/ClientInTimeSheetMgmt";

export const addCompanyMgmt = async (record) => {
  console.log("recordObj for addCompanyMgmt" + JSON.stringify(record));
  let recordObj = JSON.parse(record["body"]);
  return await addCompanyMgmtCore(recordObj);
};

export const addCompanyMgmtCore = async (recordObj) => {
  console.log("recordObj for addCompanyMgmt" + JSON.stringify(recordObj));
  let requiredFileds = ["snrId"];
  recordObj.expiryDate = expiryDate();
  recordObj.companyId = uuidv4();
  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_MGMT
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getCompanyInfoCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const addDefaultCompanyInfo = async (recordObj) => {
  console.log(
    "recordObj for addDefaultCompanyInfo" + JSON.stringify(recordObj)
  );
  let requiredFileds = ["snrId"];
  recordObj.expiryDate = expiryDate();
  recordObj.companyId = uuidv4();

  recordObj.companyName = "Walmart LLC";
  recordObj.isAllowAttachTimeSheet = true;
  recordObj.timeSheetInfo = {
    contractTSApproval: "REPORTING_MGR",
    employeeTSApproval: "REPORTING_MGR",
    reminderInfo: {
      isSendReminder: true,
      maxNumberOfReminders: "UNTILL_SUBMITTED",
      reminders: {
        postTimeSheetReminder: {
          timeToSend: "19:30",
        },
        preTimeSheetReminder: {
          dayToSend: "FRIDAY_OF_WEEK",
          seqNumber: "1",
          timeToSend: "00:33",
        },
      },
      timeSheetDeadLine: "FRIDAY_OF_WEEK",
    },
    timeSheetFrequency: "WEEKLY",
  };

  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_MGMT
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getCompanyInfoCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateCompanyMgmt = async (record) => {
  log.debug(`updateCompanyMgmt -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getCompanyInfoCore(recordObj);
  let requiredFileds = ["snrId", "companyId"];
  const pkFieldNm = "snrId";
  const skFieldNm = "creationDate";
  let keyObj = {
    snrId: recordObj.snrId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateCompanyMgmt keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_MGMT,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    const clientResponse = await getClientsIsCompany({
      pathParameters: updateResponse.body.Attributes,
    });
    const companyResponse = updateResponse.body.Attributes;

    const clientResponseArray = JSON.parse(clientResponse.body);

    for (let i = 0; i < clientResponseArray.length; i++) {
      await updateClient({
        body: JSON.stringify({
          ...clientResponseArray[i],
          clientName: companyResponse.companyName,
          firstName: companyResponse.firstName,
          lastName: companyResponse.lastName,
          timeSheetInfo: (companyResponse.timeSheetInfo ?? [])[0],
          address: (companyResponse.address ?? [])[0],
        }),
      });
    }

    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteCompanyMgmt = async (record) => {
  let recordObj = {};

  recordObj.snrId = record.pathParameters.snrId;
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFileds = ["snrId", "companyId"];
  if (recordObj.snrId != null && recordObj.companyId != null) {
    let getResponse = await getCompanyInfoCore(recordObj);

    let keyObj = {
      snrId: recordObj.snrId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_MGMT,
      keyObj
    );

    let response = { body: "DELETE_SUCCESS" };
    return apiResponse(response);
  } else {
    log.debug(`Required data is missing`);
    let errorMsg = validationResponse;
    response = {
      body: "DELETE_FAILED",
      description: errorMsg,
      statusCode: "501",
    };

    return response;
  }
};

export const getCompanyInfoCore = async (recordObj) => {
  let requiredFileds = ["snrId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_MGMT,
    IndexName: "LSI_companyId",
    KeyConditionExpression: "snrId = :snrId and companyId=:companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":snrId": recordObj.snrId,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getCompanyInfo  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getCompanyDtls = async (record) => {
  let recordObj = {};
  recordObj.snrId = record.pathParameters.snrId;
  recordObj.companyId = record.pathParameters.companyId;

  let response = await getCompanyInfoCore(recordObj);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items[0]);
  } else {
    return apiError(500, response);
  }
};

export const getCompanyInfo = async (record) => {
  let recordObj = {};
  recordObj.snrId = record.pathParameters.snrId;
  let requiredFileds = ["snrId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_MGMT,
    KeyConditionExpression: "snrId = :snrId",
    FilterExpression:
      "expiryDate = :expiryDate and COMPANY_STATUS =:COMPANY_STATUS",
    ExpressionAttributeValues: {
      ":snrId": recordObj.snrId,
      ":COMPANY_STATUS": "REGISTERED",
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getCompanyInfo  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

// export const getCompanyInfoActived = async (record) => {
//   let recordObj={};
//   recordObj.snrId=record.pathParameters.snrId;
//   let requiredFileds = ["snrId"];
//   let params = {
//     TableName: AppConfig.DBT_COMPANY_MGMT,
//     KeyConditionExpression: 'snrId = :snrId',
//     FilterExpression: "expiryDate = :expiryDate",
//     ExpressionAttributeValues: {
//       ':snrId':  recordObj.snrId,
//       ""
//       ':expiryDate':expiryDate()
//     }

//   };
//   let response = await getRecord(recordObj, requiredFileds, params);
//   log.debug(`getCompanyInfo  response=> ${JSON.stringify(response)}`);

//   if (response != null && response.statusCode == "200") {

//     return apiResponse(response.body.Items);
//   } else {
//     return apiError(500, response);
//   }

// };
