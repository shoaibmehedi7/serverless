import { log } from "./logger";
import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';
import { AppConfig } from '../environment/appconfig';
import { KMS } from 'aws-sdk';

const kms = new KMS({
  accessKeyId: AppConfig.AWS_SECRET_KEY_ID,
  secretAccessKey: AppConfig.AWS_SECRET_KEY_VAL,
  region: AppConfig.REGION,
});



export const encryptData = async (dataToBeEncrypted) => {   // import should be String
  log.debug(`encryptData  -> ${dataToBeEncrypted}`);

  const generatorKeyId = AppConfig.KMS_ID_001; //'arn:aws:kms:us-east-1:767908273889:alias/justOtpUserReferemce'
  //const generatorKeyId = 'arn:aws:kms:us-east-1:767908273889:alias/justOtpUserReferemce';
  //const keyIds = ['arn:aws:kms:us-east-1:767908273889:key/4784254e-482c-45f4-859f-2626d8785e30']
  const keyIds = [AppConfig.KMS_ID_002];

  const { encrypt } = buildClient(
    CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
  );

  const keyring = new KmsKeyringNode({ generatorKeyId, keyIds })


  const params = {
    KeyId: AppConfig.KMS_ID_002,
    Plaintext: dataToBeEncrypted,
  };
  const { CiphertextBlob } = await kms.encrypt(params).promise();

  // store encrypted data as base64 encoded string
  return CiphertextBlob.toString('base64');
};

export const decryptData = async (dataToBeDecrypted) => {
  const params = {
    CiphertextBlob: Buffer.from(dataToBeDecrypted, 'base64'),
  };
  
  const { Plaintext } = await kms.decrypt(params).promise();

  let decryptDataValObj= JSON.parse(Plaintext.toString());
  log.debug(`decryptDataValObj ==> ${JSON.stringify(decryptDataValObj)}`)

  return decryptDataValObj;
}

