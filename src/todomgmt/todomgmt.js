import { apiResponse } from "../commons/http-helpers/api-response";
let todos= [{
  id:1,
  todoName:"wakeup at 5",
  todoDetails:"onek kaj ase tai uthte hbe"
},{
  id:2,
  todoName:"prepare bed tea for babe",
  todoDetails:"need to prepare coffee to save my ass"
},{
  id:3,
  todoName:"study at 9",
  todoDetails:"final exam preparation"
}];
export const todoAdd = async (record) => {
  let recordObj = JSON.parse(record["body"]);
  console.log("recordObj for addCompanyMgmt" ,(recordObj));
    return apiResponse(recordObj);
  };



  export const todoGet = async ( ) => {
    return apiResponse(todos);
  };


  export const todoDelete = async (record) => {
   //todo
  };

  export const todoUpdate = async (record) => {

  };

