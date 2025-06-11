import { VERSION_NAME } from "../Constants/App";

export const ENDPOINTS = {
    users: '/users',
    auth: {
        login: "/api/json/mobile/authenticate?app_version="+VERSION_NAME+"&token=",
        logout: '',
    },
    
  };
  