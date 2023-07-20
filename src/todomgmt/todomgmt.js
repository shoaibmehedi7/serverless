export const todoAdd = async (record) => {
    console.log("recordObj for addCompanyMgmt" + JSON.stringify(record));
    let recordObj = JSON.parse(record["body"]);
    return recordObj;
  };



  export const todoGet = async ( ) => {
    const todo= {
        todoName:"wakeup at 5",
        todoDetails:"onek kaj ase tai uthte hbe"
    };
    return todo;
  };


  export const todoDelete = async (record) => {
   //todo
  };

  export const todoUpdate = async (record) => {
 
  //todo
  };

