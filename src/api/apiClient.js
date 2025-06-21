import axios from 'axios';
import { endPoints } from './endPoints';
import util from '../utils/util';

const apiClient = axios.create({
    baseURL: endPoints.BASE_URL, // Replace with actual backend URL or IP if using Expo Go
    timeout: 60000,
});

  
apiClient.interceptors.request.use(async config => {
    const accessToken = await util.getAccessToken();
    // console.log("accessToken : ", accessToken)
    if (config.headers) {
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        if(config?.url?.includes('maps.googleapis.com')){
          config.baseURL = ''
        }
        if(config.url == endPoints.URL_UPLOAD_ATTACHMENTS){
          config.headers['Content-Type'] =   `multipart/form-data`
        }
        if(config.url == endPoints.URL_UPLOAD_DAILY_ENTRY || config.url == endPoints.URL_CREATE_DAILY_DAIRY){
          config.headers['Content-Type'] =  "application/json"; //config.headers
        }
    }

    return config;
  });
  
  apiClient.interceptors.response.use(response => {
    
    return Promise.resolve(response);
  }, function (error) {
    console.log("Error ww: ",error);
    if (error?.response) {
      return Promise.resolve(error.response);
    }
    return Promise.resolve(error);
  });

  export default {
    get: async (url, config = {}) => {
      try {
        return await apiClient.get(url, config);
      } catch (e) {
        return e.response;
      }
    },
    post: async (url, data, config) => {
      try {
        return await apiClient.post(url, data, config);
      } catch (e) {
        return e.response;
      }
    },
    delete: async (url, config) => {
      try {
        return await apiClient.delete(url, config);
      } catch (e) {
        return e.response;
      }
    },
    patch: async (url, data, config) => {
      try {
        return await apiClient.patch(url, data, config);
      } catch (e) {
        return e.response;
      }
    },
  };