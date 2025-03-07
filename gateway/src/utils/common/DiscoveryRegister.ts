


/*






FILE NOT USED IN THIS MICROSSERVICE  <-----





*/

// import axios, { AxiosError } from "axios";
// import envVars from "./LoadEnvVars";
// import { ErrorResponseDto } from "../../dto/common/ErrorResponseDto";


// export default class DiscoveryRegister {

//   public static async registerService(): Promise<boolean> {
//     try {
//       await axios.post(envVars.DISCOVERY_URL, {
//         category: envVars.CATEGORY,
//         url: envVars.SERVICE_URL,
//       });
//       console.log("Registered with discovery API");
//       return true; // Retorna verdadeiro se a tentativa de registro for bem-sucedida
//     } catch (error) {
//       const axiosError = error as AxiosError<ErrorResponseDto>;
//       console.error("Failed to register service:", axiosError.message);
//       return false; // Retorna falso se a tentativa de registro falhar
//     }
//   };

//   public static async doRegistrationWithRetry(max_retries = 10, retry_delay = 3000) {

//     for (let attempt = 1; attempt <= max_retries; attempt++) {
//       const success = await DiscoveryRegister.registerService();
//       if (success) { break; } // Se o registro for bem-sucedido, para de tentar

//       if (attempt < max_retries) {
//         console.log(`Retrying in ${retry_delay / 1000} seconds... (Attempt ${attempt})`);
//         await new Promise(resolve => setTimeout(resolve, retry_delay)); // Espera antes de tentar novamente
//       } else {
//         console.error("Failed to register service after maximum retries");
//         process.exit(1); // Termina o serviço com erro após atingir o máximo de tentativas
//       }
//     }
//   }
// }
