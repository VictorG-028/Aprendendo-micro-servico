import dotenv from 'dotenv';

class EnvVars {
  PORT: number;
  // CATEGORY: string;
  // DOMAIN: string;
  // SERVICE_URL: string;
  // DISCOVERY_URL: string;

  public constructor() {
    // const isDevDocker = process.env.ENVIRONMENT === 'docker';

    dotenv.config();

    this.PORT = parseInt(process.env.PORT as string);
    // this.CATEGORY = process.env.CATEGORY ?? this.throwMissingEnvError('CATEGORY');
    // if (isDevDocker) {
    //   this.DOMAIN = process.env.DOMAIN ?? this.throwMissingEnvError('DOMAIN');
    //   this.DISCOVERY_URL = process.env.DISCOVERY_URL ?? this.throwMissingEnvError('DISCOVERY_URL');
    // } else {
    //   this.DOMAIN = "localhost";
    //   this.DISCOVERY_URL = "http://localhost:8000";
    // }
    // this.SERVICE_URL = `http://${this.DOMAIN}:${this.PORT}`;
  }


  private throwMissingEnvError(variable: string): never {
    console.error(`Missing environment variable: ${variable}`);
    process.exit(1);
  }

}
const envVars = new EnvVars();
export default envVars;
