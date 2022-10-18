import { log } from '../../commons/utils/logger';
import { AppConfig } from '../../commons/environment/appconfig';
import * as AWS from 'aws-sdk';




export const getDbClient = () => {
    const dbClient = new AWS.DynamoDB.DocumentClient();
    log.debug(`AppConfig.environment=>${AppConfig.environment}`);
    if (AppConfig.environment === 'dev' || AppConfig.environment === 'test') {
        // AWS.config.update({
        //     region: "us-east-1",endpoint: "http://localhost:8000"
        //   });

     
            AWS.config.update({
                region: "us-east-1"
              });
    } 
  
    return dbClient;

};


export const getSNSClient = () => {
    const snsClient = new AWS.SNS();
    log.debug(`AppConfig.environment=>${AppConfig.environment}`);
    if (AppConfig.environment === 'dev' || AppConfig.environment === 'test') {
        AWS.config.update({
            region: "us-east-1"
          });
    } 
    const sns = new AWS.SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });

    return sns;

};