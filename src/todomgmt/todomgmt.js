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

  //let recordObj = todosNew;
  
  let recordObj = JSON.parse(record["body"]);
  todos.push(recordObj);
  return apiResponse(todos);
   
  

  };



  export const todoGet = async ( ) => {
    return apiResponse(todos);


    const users = [
      {
        name:"abir",
        dob:"345"
      },
      {
        name:"samin",
        dob:"654"
      }
    ]

    const payloadUsers = [
      {
        name:"minhaz",
        dob:"345"
      },
      {
        name:"polash",
        dob:"654"
      }
    ]

    const result =[ ...users,...payloadUsers]

    const userFirstPart = {
      name:"polash",
      dob:"654"
    }
    const usersecpmdPart = {
      name:"polash",
      dob:"654"
    }

    const user = {...userFirstPart,...usersecpmdPart}
  };


  export const todoDelete = async (record) => {

  let recordObj = JSON.parse(record["body"]);
  console.log(recordObj,"record print")

  for(let i = recordObj.length - 1; i >= 0; i--){
      if(recordObj[i].id == 2){
        recordObj.splice(i, 1);
      }
  }
  
  return apiResponse(recordObj);
  };

  export const todoUpdate = async (record) => {
    // let jsonStr = '{"name":"ABC", "age":10, "phone":["1234567890","1234567890"]}';
    // let jsonObj = JSON.parse(jsonStr);
    // delete jsonObj.name;
    // let key = 'age';
    // delete jsonObj[key];
  //   let recordObj = JSON.parse(record["body"]);
  // if(recordObj.id=3)
  // {recordObj.pop();}

  let test= [{
    id:2,
    todoName:"hahahah",
    todoDetails:"nannananan"
  }];


  let recordObj = JSON.parse(record["body"]);
  
  for(let i = 0;i<recordObj.length ;  i++){
      if(recordObj[i].id == 2){
        recordObj.splice(i, 1);
        recordObj.push(test);
        //recordObj.splice(i,0, test);
       // recordObj[i]=test;
     
      }
  }
  
  return apiResponse(recordObj);
  };
  

