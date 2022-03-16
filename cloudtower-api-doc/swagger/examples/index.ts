import { SwaggerApi } from '../../declerations/swagger-api';
import { SupportLanguage } from '../utils';
import { getUserRoleNexts } from "./getUserRoleNexts";
import { getUserRoleNextsConnection } from './getUserRoleNextsConnection';
import { getCreateUserRoleNexts} from './getCreateUserRoleNexts';


export const getExamples = (api: SwaggerApi, lng: SupportLanguage ) => {
  switch(api) {
    case '/get-user-role-nexts':
      return getUserRoleNexts(lng);
    case '/get-user-role-nexts-connection':
      return getUserRoleNextsConnection(lng);
    case '/create-role':
      return getCreateUserRoleNexts(lng);
    default:
      return null;
  }
};
