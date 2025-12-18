const fs = require("fs");
// Configure Angular `environment.ts` file path
const targetPath = "./src/environments/environment.ts";
// Load node modules
require("dotenv").config();

const parseJsonEnv = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.warn("Failed to parse JSON env var:", value);
    return value;
  }
};

// `environment.ts` file structure
const envConfigFile = `
import { EnvironmentAttestation } from './EnvironmentAttestation';

export const environment = {
    apiUrl: '${process.env.DOMAIN_NAME}',
    appName: '${process.env.APP_NAME}',
    jar_mode: '${process.env.JAR_MODE}',
	  openid4vpDraft: '${process.env.OPENID4VP_DRAFT}',
	  attestation: ${JSON.stringify(
      parseJsonEnv(process.env.ATTESTATION)
    )} as  EnvironmentAttestation[],
};`;

fs.writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular environment.ts file generated correctly at ${targetPath} \n`
    );
  }
});
