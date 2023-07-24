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

  
  };


  export const todoDelete = async (record) => {

  let recordObj = JSON.parse(record["body"]);
  console.log(recordObj,"record print")
 // let holder= recordObj.id;

  for(let i = todos.length - 1; i >= 0; i--){
      if(todos[i].id == recordObj.id){
        todos.splice(i, 1);
      }
  }
  
  return apiResponse(todos);
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

 


  let recordObj = JSON.parse(record["body"]);
  console.log(recordObj)
  
  for(let i = 0;i<todos.length ;  i++){
      if(todos[i].id == recordObj.id){
        todos.splice(i, 1,recordObj);
        // todos.push(recordObj);
        // todos.sort
        // console.log(todos.sort +'sorteeeeeeeeeeeeeeeed')
        //recordObj.splice(i,0, test);
       // recordObj[i]=test;
     
      }
  }
  
  return apiResponse(todos);
  };
 



  export const todoDeleteMultiple = async (record) => {

  let recordObj = JSON.parse(record["body"]);
  console.log(recordObj,"record print")
  for(let element of recordObj){
    for(let i = todos.length - 1; i >= 0; i--){
        if(todos[i].id == element.id){
          todos.splice(i, 1);
        }
    }
  }  
  return apiResponse(todos);
  };




  export const todoPartialSearch = async (record) => { 
  let recordObj = JSON.parse(record["body"]);
  console.log(typeof(recordObj))
  for(let i = 0;i<todos.length ;  i++){
   if(todos[i].id.toString().includes(recordObj.toString())||todos[i].todoName.toString().includes(recordObj.toString())||todos[i].todoDetails.toString().includes(recordObj.toString()))
      
      todos.splice(i, 1);
      }
  

  return apiResponse(todos);
  };



export const todoBatchUpdate = async (record) => {
let recordObj = JSON.parse(record["body"]);
  
for(let element of recordObj){
  for(let i = 0;i<todos.length ;  i++){
      if(todos[i].id == element.id){
        todos.splice(i, 1,element);
       
     
      }
  }
}
  return apiResponse(todos);
  };


  export const todoDeleteByName = async (record) => {

    let recordObj = JSON.parse(record["body"]);
    console.log(recordObj,"record print")
  
    for(let i = todos.length - 1; i >= 0; i--){
        if(todos[i].todoName == recordObj.todoName){
          todos.splice(i, 1);
        }
    }
    
    return apiResponse(todos);
    };  