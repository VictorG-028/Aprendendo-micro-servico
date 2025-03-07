


/*






NOT USED IN THIS MICROSSERVICE






*/




// import axios, { AxiosError } from "axios";
// import { ErrorResponseDto } from '../../dto/common/ErrorResponseDto';
// import envVars from "./LoadEnvVars";

// type ServiceCategory = "user" | "payments" | "product";

// export async function getOtherServiceUrl(category: ServiceCategory): Promise<string | null> {
//   try {
//     const response = await axios.get(`/${envVars.DISCOVERY_URL}/services/${category}`);
//     const data = response.data;
//     if (data && data.urls && data.urls.length > 0) {
//       return data.urls[0];  // Escolher a lógica adequada para selecionar a URL
//     }
//
//     return null;
//
//   } catch (error) {
//     const axiosError = error as AxiosError<ErrorResponseDto>;
//     const errorMessage = axiosError.response?.data?.message || "error message is undefined";
//     console.error(`Error fetching service URL: ${errorMessage}`);
//     return null;
//   }
// }
