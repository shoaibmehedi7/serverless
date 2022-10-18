import {
  archieveDate,
  currentDate,
  currentDateTime,
  expiryDate,
} from "../commons/constants";
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
  addCognitoTeamMember,
  deleteCognitoTeamMember,
} from "./CognitoTeamMemberMgmt";
import {
  getTimeSheetsSubmittedForMember,
  updateTimeSheet,
} from "../timesheetmgmt/TimeSheetInTimeSheetMgmt";

export const getTeamManagersForCmpny = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    IndexName: "LSI_isManager",
    KeyConditionExpression: "companyId = :companyId and isManager=:isManager",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":isManager": "Y",
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(
    `getTeamManagersForCmpny  11111....response=> ${JSON.stringify(response)}`
  );
  return apiResponse(response.body.Items);
  //return response;
};

export const getApplTeamMembersForMgr = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.managerId = record.pathParameters.managerId;
  let requiredFileds = ["managerId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR, //1
    IndexName: "LSI_managerId",
    KeyConditionExpression: "companyId = :companyId and managerId=:managerId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":managerId": recordObj.managerId,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);
  return apiResponse(response.body.Items);
};

export const assignmentNewManager = async (record) => {
  let recordManager = JSON.parse(record["body"]);
  let requiredFiledsManager = ["companyId", "managerId", "changingManagerId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR, //1
    IndexName: "LSI_managerId",
    KeyConditionExpression: "companyId = :companyId and managerId=:managerId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":managerId": recordManager.managerId,
      ":companyId": recordManager.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  console.log("changingManagerId =>>>", recordManager.changingManagerId);
  let response = await getRecord(recordManager, requiredFiledsManager, params);
  console.log(`assignmentNewManager  response=> ${JSON.stringify(response)}`);

  const arrData = response.body.Items;
  const updatedData = [];
  for (let i = 0; i < arrData.length; i++) {
    let recordObj = arrData[i];
    recordObj.managerId = recordManager.changingManagerId;
    let requiredFileds = ["companyId", "teamMemberId", "creationDate"];
    const pkFieldNm = "companyId";
    const skFieldNm = "creationDate";
    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: recordObj.creationDate,
    };

    console.log(`updateApplTeamMember keyObj -> ${JSON.stringify(keyObj)}`);
    let updateResponse = await updateRecord(
      recordObj,
      requiredFileds,
      pkFieldNm,
      skFieldNm,
      AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
      keyObj
    );
    if (updateResponse != null && updateResponse.statusCode == "200") {
      updatedData.push(updateResponse.body.Attributes);
    } else {
      return apiError(500, updateResponse);
    }
  }

  return apiResponse([...updatedData]);
};

export const addApplTeamMember = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  console.log(`addApplTeamMember 1.....${recordObj}`);
  return await addApplTeamMemberCore(recordObj, true);
};

export const addApplTeamMemberCore = async (recordObj, createCogUser) => {
  console.log(`addApplTeamMemberCore called.....${JSON.stringify(recordObj)}`);
  console.log(`createCogUser called.....${createCogUser}`);
  let requiredFileds = ["teamMemberId"];
  recordObj.expiryDate = expiryDate();
  recordObj.teamMemberId = uuidv4();
  let recordObj1 = {};
  recordObj1.expiryDate = recordObj.expiryDate;
  recordObj1.teamMemberId = recordObj.teamMemberId;
  recordObj1.email = recordObj.email;
  recordObj1.companyId = recordObj.companyId;

  if (createCogUser) {
    let cognitoPoolResponse = await addCognitoTeamMember(recordObj);
    console.log(`cognitoPoolResponse.....${cognitoPoolResponse}`);
  }

  console.log(`addApplTeamMemberCore called.....${recordObj}`);
  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_APPL_TEAM_MBR
  );
  console.log(
    `DBT_COMPANY_APPL_TEAM_MBR called.....${JSON.stringify(addResponse)}`
  );
  if (addResponse != null && addResponse.statusCode == "200") {
    let addResponse = await addRecord(
      recordObj1,
      requiredFileds,
      AppConfig.DBT_TEAM_MBR //2
    );

    let getResponse = await getApplTeamMemberCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

// export const addCognitoUser = async (recordObj)=> {

//     console.log(event['body'])
//     try {
//         const username = JSON.parse(event['body'])['username'];
//         console.log("=======>username", username, event['body'], event['body'].username, typeof event['body']);
//         const password = event['body']['password'];
//         const email = event['body']['email'];
//         let response = {};
//         const userRes = await iam.createUser({
//             UserName: username,
//             PermissionsBoundary: "arn:aws:iam::472882047557:policy/apigatewayforregistration_api"
//         }).promise().catch(err => { response = apiError(err.message, err.statusCode) });
//         if (userRes) {
//             try {
//                 await iam.attachUserPolicy({ UserName: username, PolicyArn: "arn:aws:iam::472882047557:policy/apigatewayforregistration_api" }).promise()
//                 const db = await connectToDb();
//                 const encryptedPassword = await encryptPassword(password)
//                 await db.collection(collectionName).insertOne({
//                     username: userRes.User.UserName,
//                     iamUserId: userRes.User.UserId,
//                     password: encryptedPassword,
//                     email,
//                     isActive: true,
//                     createdAt: userRes.User.CreateDate,
//                 })
//                 response = apiResponse({ username: userRes.User.UserName, createdAt: userRes.User.CreateDate, email }, "User created successfully!", 201)
//             } catch (error) {
//                 console.log("deleting the user from the iam role", username, email);
//                 await iam.detachUserPolicy({ UserName: username, PolicyArn: "arn:aws:iam::472882047557:policy/apigatewayforregistration_api" }).promise()
//                 iam.deleteUser({
//                     UserName: username
//                 }, (err, data) => {
//                     if (err) console.log("Error deleting the user from IAM role", err, username);
//                     if (data) {
//                         console.log("user deleted", username, data);
//                     }
//                 })
//                 response = apiError("Internal server error", 500);
//             }
//         }
//         console.log(response);
//         return response;
//     } catch (error) {
//         return apiError("Internal server error", 500);
//     }

// }
export const updateApplTeamMember = async (record) => {
  log.debug(`updateApplTeamMember -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);
  let getResponse = await getApplTeamMemberCore(recordObj);
  let requiredFileds = ["companyId", "teamMemberId", "creationDate"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };

  log.debug(`updateApplTeamMember keyObj -> ${JSON.stringify(keyObj)}`);
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {

    //drop asynchronous message :::  send firstName, lastName, email, address
    await SNS_TEAM_MEMBER_UPDATE({
      teamMemberId: resData.teamMemberId,
      creationDate: resData.creationDate,
      eventCode: "SNS_TEAM_MEMBER_UPDATE",
      companyId: resData.companyId,
    });

    // get timesheet for team member has status is submitted
    // check updateResponse.managerId exist &&  timesheet upon.length > 0
    // => update all of timesheet upon to managerId

    console.log(
      "updateResponse.body.managerName",
      updateResponse.body.Attributes.managerName
    );

    const _objUpdateResponse = updateResponse.body.Attributes;
    if (_objUpdateResponse.managerId) {
      const tsSubmittedForMemberResponse =
        await getTimeSheetsSubmittedForMember({
          pathParameters: {
            ..._objUpdateResponse,
            companyId: keyObj.companyId,
          },
        });

      if (JSON.parse(tsSubmittedForMemberResponse.body).length) {
        const tsSubmittedForMemberResponseArray = JSON.parse(
          tsSubmittedForMemberResponse.body
        );

        let updateTimeSheetSubmittedForMember;
        for (let i = 0; i < tsSubmittedForMemberResponseArray.length; i++) {
          updateTimeSheetSubmittedForMember = await updateTimeSheet({
            body: JSON.stringify({
              companyId: tsSubmittedForMemberResponseArray[i].companyId,
              teamMemberId: tsSubmittedForMemberResponseArray[i].teamMemberId,
              timeSheetId: tsSubmittedForMemberResponseArray[i].timeSheetId,
              managerId: _objUpdateResponse.managerId,
            }),
          });
        }
        return apiResponse(updateResponse);
      }
    }
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const archieveTeamMember = async (record) => {
  log.debug(`archieveTeamMember -> ${JSON.stringify(record)}`);
  let recordObj = JSON.parse(record["body"]);

  let getResponse = await getApplTeamMemberCore(recordObj);

  let requiredFileds = ["companyId", "teamMemberId", "creationDate"];
  const pkFieldNm = "companyId";
  const skFieldNm = "creationDate";
  let keyObj = {
    companyId: recordObj.companyId,
    creationDate: getResponse.body.Items[0].creationDate,
  };
  recordObj.expiryDate = currentDate();
  log.debug(`archieveTeamMember keyObj -> ${JSON.stringify(keyObj)}`);
  log.debug(
    `archieveTeamMember expiryDate currentDate -> ${JSON.stringify(keyObj)}`
  );
  let updateResponse = await updateRecord(
    recordObj,
    requiredFileds,
    pkFieldNm,
    skFieldNm,
    AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    keyObj
  );
  if (updateResponse != null && updateResponse.statusCode == "200") {
    return apiResponse(updateResponse);
  } else {
    return apiError(500, updateResponse);
  }
};

export const getArchieveTeamMember = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;

  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate <> :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getArchieveTeamMember  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const deleteApplTeamMember = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.teamMemberId = record.pathParameters.teamMemberId;
  let requiredFileds = ["companyId", "teamMemberId"];
  let deletMemberHashDataRes = {};
  if (recordObj.companyId != null && recordObj.teamMemberId != null) {
    let getResponse = await getApplTeamMemberCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
      keyObj
    );
    console.log(
      "deletMemberHashDataRes DBT_COMPANY_APPL_TEAM_MBR",
      JSON.stringify(deletMemberHashDataRes)
    );

    const teamMemberCoreResponse = await getTeamMemberCore({
      ...recordObj,
      email: getResponse.body.Items[0].email,
    });

    console.log(
      "teamMemberCoreResponse ",
      JSON.stringify(teamMemberCoreResponse)
    );
    let keyObj1 = {
      email: teamMemberCoreResponse.body.Items[0].email,
      creationDate: teamMemberCoreResponse.body.Items[0].creationDate,
    };

    deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_TEAM_MBR,
      keyObj1
    );

    console.log(
      "deletMemberHashDataRes DBT_TEAM_MBR",
      JSON.stringify(deletMemberHashDataRes)
    );

    const _deleteCognitoTeamMember = await deleteCognitoTeamMember({
      email: keyObj1.email,
    });

    let response;
    if (_deleteCognitoTeamMember.body) {
      response = { body: "DELETE_SUCCESS" };
      return apiResponse(response);
    } else {
      response = {
        body: "DELETE_FAILED",
        description: _deleteCognitoTeamMember.error,
        statusCode: "501",
      };
      return apiError(500, response);
    }
  } else {
    log.debug(`Required data is missing`);
    let errorMsg = deletMemberHashDataRes;
    let response = {
      body: "DELETE_FAILED",
      description: errorMsg,
      statusCode: "501",
    };

    return response;
  }
};

export const deleteApplTeamMemberNotCognito = async (record) => {
  let recordObj = {};

  recordObj.companyId = record.pathParameters.companyId;
  recordObj.teamMemberId = record.pathParameters.teamMemberId;
  let requiredFileds = ["companyId", "teamMemberId"];
  let deletMemberHashDataRes = {};
  if (recordObj.companyId != null && recordObj.teamMemberId != null) {
    let getResponse = await getApplTeamMemberCore(recordObj);

    let keyObj = {
      companyId: recordObj.companyId,
      creationDate: getResponse.body.Items[0].creationDate,
    };
    console.log("keyObj ==>", keyObj);

    deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
      keyObj
    );
    console.log(
      "deletMemberHashDataRes DBT_COMPANY_APPL_TEAM_MBR",
      JSON.stringify(deletMemberHashDataRes)
    );

    const teamMemberCoreResponse = await getTeamMemberCore({
      ...recordObj,
      email: getResponse.body.Items[0].email,
    });

    console.log(
      "teamMemberCoreResponse ",
      JSON.stringify(teamMemberCoreResponse)
    );
    let keyObj1 = {
      email: teamMemberCoreResponse.body.Items[0].email,
      creationDate: teamMemberCoreResponse.body.Items[0].creationDate,
    };

    deletMemberHashDataRes = await deleteRecord(
      {},
      [],
      AppConfig.DBT_TEAM_MBR,
      keyObj1
    );

    console.log(
      "deletMemberHashDataRes DBT_TEAM_MBR",
      JSON.stringify(deletMemberHashDataRes)
    );

    if (deletMemberHashDataRes.body === "DELETE_SUCCESS") {
      return apiResponse({ body: deletMemberHashDataRes.body });
    } else {
      return apiError({
        body: "DELETE_FAILED",
        description: deletMemberHashDataRes,
        statusCode: "501",
      });
    }
  } else {
    log.debug(`Required data is missing`);
    let errorMsg = deletMemberHashDataRes;
    let response = {
      body: "DELETE_FAILED",
      description: errorMsg,
      statusCode: "501",
    };

    return response;
  }
};

export const getApplTeamMemberCore = async (recordObj) => {
  let requiredFileds = ["teamMemberId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression:
      "companyId = :companyId and teamMemberId=:teamMemberId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":teamMemberId": recordObj.teamMemberId,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getTeamMemberCore = async (recordObj) => {
  let requiredFileds = ["teamMemberId"];
  let params = {
    TableName: AppConfig.DBT_TEAM_MBR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression: "teamMemberId = :teamMemberId and email =:email",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":teamMemberId": recordObj.teamMemberId,
      ":email": recordObj.email,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getTeamMemberCore  response=> ${JSON.stringify(response)}`);
  return response;
};

export const getApplTeamMemberByEmail = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.email = record.pathParameters.email;
  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    IndexName: "LSI_email",
    KeyConditionExpression: "companyId = :companyId and email=:email",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":email": recordObj.email,
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMemberByEmail  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getApplTeamMembers = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;

  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    KeyConditionExpression: "companyId = :companyId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

/*
{
  "teamMemberId":"1",
  "applicationId":"1",
  "roleNm":"",
  "creationDt":"",
  "expiryDt":""
}
*/
export const assignRolesToTeamMember = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  let requiredFileds = ["teamMemberId"];
  recordObj.expiryDate = expiryDate();
  let addResponse = await addRecord(
    recordObj,
    requiredFileds,
    AppConfig.DBT_COMPANY_APPL_TEAM_MBR_ROLE
  );

  if (addResponse != null && addResponse.statusCode == "200") {
    let getResponse = await getApplTeamMemberCore(recordObj);
    console.log(`getResponse:: ${getResponse.body.Items[0]}`);
    return apiResponse(getResponse.body.Items[0]);
  } else {
    return apiError(500, addResponse);
  }
};

export const getApplTeamMembersForAppl = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.applicationId = record.pathParameters.applicationId;

  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR_ROLE,
    IndexName: "LSI_applicationId",
    KeyConditionExpression:
      "companyId = :companyId and applicationId =:applicationId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":applicationId": recordObj.applicationId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    return apiResponse(response.body.Items);
  } else {
    return apiError(500, response);
  }
};

export const getApplTeamMembersAndManagerDetails = async (record) => {
  let recordObj = {};
  recordObj.companyId = record.pathParameters.companyId;
  recordObj.teamMemberId = record.pathParameters.teamMemberId;

  let requiredFileds = ["companyId"];
  let params = {
    TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
    IndexName: "LSI_teamMemberId",
    KeyConditionExpression:
      "companyId = :companyId and teamMemberId =:teamMemberId",
    FilterExpression: "expiryDate = :expiryDate",
    ExpressionAttributeValues: {
      ":companyId": recordObj.companyId,
      ":teamMemberId": recordObj.teamMemberId,
      ":expiryDate": expiryDate(),
    },
  };
  let response = await getRecord(recordObj, requiredFileds, params);
  log.debug(`getApplTeamMember  response=> ${JSON.stringify(response)}`);

  if (response != null && response.statusCode == "200") {
    const res = response.body.Items[0];
    if (res.managerId) {
      let recordObjManager = {};
      recordObjManager.companyId = res.companyId;
      recordObjManager.teamMemberId = res.managerId;

      let requiredFiledsManager = ["companyId"];
      let paramsManager = {
        TableName: AppConfig.DBT_COMPANY_APPL_TEAM_MBR,
        IndexName: "LSI_teamMemberId",
        KeyConditionExpression:
          "companyId = :companyId and teamMemberId =:teamMemberId",
        FilterExpression: "expiryDate = :expiryDate",
        ExpressionAttributeValues: {
          ":companyId": recordObjManager.companyId,
          ":teamMemberId": recordObjManager.teamMemberId,
          ":expiryDate": expiryDate(),
        },
      };

      let managerData = await getRecord(
        recordObjManager,
        requiredFiledsManager,
        paramsManager
      );
      if (managerData != null && managerData.statusCode == "200") {
        return apiResponse({
          teamMemberInfo: res,
          managerInfo: managerData.body.Items[0],
        });
      } else {
        return apiResponse({ teamMemberInfo: res });
      }
    } else {
      return apiResponse({ teamMemberInfo: res });
    }
  } else {
    return apiError(500, response);
  }
};
