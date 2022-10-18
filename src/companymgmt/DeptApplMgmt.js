import { currentDate, expiryDate } from "../commons/constants";
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
import { getCompanyDeptMgmts } from "../companymgmt/CompanyDeptMgmt";

export const addDeptApplMgmt = async (record) => {
  let recordObj = JSON.parse(record["body"]);

  console.log("addDeptApplMgmt recordObj 1111", recordObj);

  const companyDept = await getAllCompanyDeptAppls({
    pathParameters: {
      companyDeptId: recordObj.companyDeptId,
      companyId: recordObj.companyId,
    },
  });

  console.log("addDeptApplMgmt companyDept", companyDept);

  const allApps = JSON.parse(companyDept.body);

  for (let i = 0; i < allApps.length; i++) {
    if (
      allApps[i].applicationName.trim().toUpperCase() ===
      recordObj.applicationName.trim().toUpperCase()
    ) {
      return apiError(501, {
        status: 501,
        message: "Application name is already exist in this department !",
      });
    }
  }
  return addDeptApplCore(recordObj);
};

export const getAllCompanyDeptAppls = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  console.log(
    "...record.pathParameters.companyId " + record.pathParameters.companyId
  );
  let allDepts = await getCompanyDeptMgmts(record);
  console.log("...allDepts... " + JSON.stringify(allDepts));
  let allAppl = [];
  let allDeptObj = JSON.parse(allDepts.body);

  console.log("...allDeptObj... " + allDeptObj);
  for (let index = 0; index < allDeptObj.length; index++) {
    if (
      allDeptObj[index].companyDeptId === record.pathParameters.companyDeptId
    ) {
      console.log("...INDEX IS ......" + index);
      let eachDept = allDeptObj[index];
      console.log("...eachDept... " + JSON.stringify(eachDept));
      let requiredFileds = ["companyId"];
      let params = {
        TableName: AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
        KeyConditionExpression: "companyDeptId = :companyDeptId",
        FilterExpression: "expiryDate = :expiryDate",
        ExpressionAttributeValues: {
          ":companyDeptId": eachDept.companyDeptId,
          ":expiryDate": expiryDate(),
        },
      };

      console.log("...recordObj " + JSON.stringify(recordObj));
      console.log("...params " + JSON.stringify(params));
      let eachResponse = await getRecord(recordObj, requiredFileds, params);
      let eachResponseItems = eachResponse.body.Items;

      console.log("...eachResponseItems length::::" + eachResponseItems.length);
      if (eachResponseItems[0]) {
        allAppl = [...eachResponseItems];
      }
      console.log("allAppl::3334343434343::" + allAppl);
    }
  }

  log.debug(`allAppl  response=> ${JSON.stringify(allAppl)}`);

  if (allAppl != null) {
    return apiResponse(allAppl);
  } else {
    return apiError(500, response);
  }
};

export const addDeptApplCore = async (recordObj) => {
  let requiredFileds = ["companyDeptId"];
  recordObj.expiryDate = expiryDate();
  recordObj.applicationId = uuidv4();

  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_DEPT_APPL_MGMT
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getDeptApplMgmtCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const updateDeptApplMgmt = async (record) => {
  log.debug(`updateDeptApplMgmt -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getDeptApplMgmtCore(recordObj);
  let requiredFileds = ["companyDeptId", "applicationId"];
  const pkFieldNm = "companyDeptId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyDeptId: recordObj.companyDeptId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateDeptApplMgmt keyObj -> ${JSON.stringify(keyObj)}`);

  // Check application name
  const companyDept = await getAllCompanyDeptAppls({
    pathParameters: {
      companyDeptId: recordObj.companyDeptId,
      companyId: recordObj.companyId,
    },
  });

  console.log("addDeptApplMgmt companyDept", companyDept);

  const allApps = JSON.parse(companyDept.body);

  for (let i = 0; i < allApps.length; i++) {
    if (
      allApps[i].applicationName.trim().toUpperCase() ===
      recordObj.applicationName.trim().toUpperCase()
    ) {
      return apiError(501, {
        status: 501,
        message: "Application name is already exist in this department !",
      });
    }
  }
  //end Check application name
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const archiveDeptApplMgmt = async (record) => {
  log.debug(`updateDeptApplMgmt -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getDeptApplMgmtCore(recordObj);
  let requiredFileds = ["companyDeptId", "applicationId"];
  const pkFieldNm = "companyDeptId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyDeptId: recordObj.companyDeptId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  recordObj.expiryDate = currentDate();
  log.debug(`updateDeptApplMgmt keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const deleteDeptApplMgmt = async (record) => {
  let recordObj = {};

  recordObj.companyDeptId = record.pathParameters.companyDeptId;
  recordObj.applicationId = record.pathParameters.applicationId;
  let requiredFileds = ["companyDeptId", "applicationId"];
  if (recordObj.companyDeptId != null && recordObj.applicationId != null) {
    let getResponse = await getDeptApplMgmtCore(recordObj);

    let keyObj = {
      companyDeptId: recordObj.companyDeptId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    let deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
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

export const getDeptApplMgmtCore = async (recordObj) => {
  let requiredFileds = ["companyDeptId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
    IndexName: "LSI_applicationId",
    KeyConditionExpression:
      "companyDeptId = :companyDeptId and applicationId=:applicationId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyDeptId": recordObj.companyDeptId,
      ":applicationId": recordObj.applicationId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getDeptApplMgmt  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getAllApplMgmt = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  console.log(
    "...record.pathParameters.companyId " + record.pathParameters.companyId
  );
  let allDepts = await getCompanyDeptMgmts(record);
  console.log("...allDepts... " + JSON.stringify(allDepts));
  let allAppl = [];
  let allDeptObj = JSON.parse(allDepts.body);
  for (let index = 0; index < allDeptObj.length; index++) {
    // for (var i = 0; i < arr.length; i++){
    //   document.write("<br><br>array index: " + i);

    console.log("...INDEX IS ......" + index);
    let eachDept = allDeptObj[index];
    console.log("...eachDept... " + JSON.stringify(eachDept));
    let requiredFileds = ["companyId"];
    let params = {
      TableName: AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
      KeyConditionExpression: "companyDeptId = :companyDeptId",
      FilterExpression: "expiryDate = :expiryDate",
      ExpressionAttributeValues: {
        ":companyDeptId": eachDept.companyDeptId,
        ":expiryDate": expiryDate(),
      },
    };

    console.log("...recordObj " + JSON.stringify(recordObj));
    console.log("...params " + JSON.stringify(params));
    let eachResponse = await getRecord(recordObj, requiredFileds, params);
    let eachResponseItems = eachResponse.body.Items;

    console.log("...eachResponseItems length::::" + eachResponseItems.length);
    for (let index1 = 0; index1 < eachResponseItems.length; index1++) {
      console.log("...eachResponseItems 12345::::" + eachResponseItems[index1]);

      allAppl.push(eachResponseItems[index1]);
    }
    console.log("allAppl::3334343434343::" + allAppl);
  }

  log.debug(`allAppl  response=> ${JSON.stringify(allAppl)}`);

  if (allAppl != null) {
    return apiResponse(allAppl);
  } else {
    return apiError(500, response);
  }
};

export const getArchiveAllApplMgmt = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  console.log(
    "...record.pathParameters.companyId " + record.pathParameters.companyId
  );
  let allDepts = await getCompanyDeptMgmts(record);
  console.log("...allDepts... " + JSON.stringify(allDepts));
  let allAppl = [];
  let allDeptObj = JSON.parse(allDepts.body);
  for (let index = 0; index < allDeptObj.length; index++) {
    // for (var i = 0; i < arr.length; i++){
    //   document.write("<br><br>array index: " + i);

    console.log("...INDEX IS ......" + index);
    let eachDept = allDeptObj[index];
    console.log("...eachDept... " + JSON.stringify(eachDept));
    let requiredFileds = ["companyId"];
    let params = {
      TableName: AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
      KeyConditionExpression: "companyDeptId = :companyDeptId",
      FilterExpression: "expiryDate <> :expiryDate",
      ExpressionAttributeValues: {
        ":companyDeptId": eachDept.companyDeptId,
        ":expiryDate": expiryDate(),
      },
    };

    console.log("...recordObj " + JSON.stringify(recordObj));
    console.log("...params " + JSON.stringify(params));
    let eachResponse = await getRecord(recordObj, requiredFileds, params);
    let eachResponseItems = eachResponse.body.Items;

    console.log("...eachResponseItems length::::" + eachResponseItems.length);
    for (let index1 = 0; index1 < eachResponseItems.length; index1++) {
      console.log("...eachResponseItems 12345::::" + eachResponseItems[index1]);

      allAppl.push(eachResponseItems[index1]);
    }
    console.log("allAppl::3334343434343::" + allAppl);
  }

  log.debug(`allAppl  response=> ${JSON.stringify(allAppl)}`);

  if (allAppl != null) {
    return apiResponse(allAppl);
  } else {
    return apiError(500, response);
  }
};

export const getDeptApplMgmts = async (record) => {
  let recordObj = {};
  recordObj.companyDeptId = record.pathParameters.companyDeptId;
  let requiredFileds = ["companyDeptId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_DEPT_APPL_MGMT,
    KeyConditionExpression: "companyDeptId = :companyDeptId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyDeptId": recordObj.companyDeptId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getDeptApplMgmt  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};
