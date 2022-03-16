import { SwaggerApi } from '../../declerations/swagger-api';
import { SupportLanguage } from '../utils';
import { getUserRoleNexts } from "./getUserRoleNexts";
import { getUserRoleNextsConnection } from './getUserRoleNextsConnection';
import { getCreateUserRoleNexts} from './getCreateUserRoleNexts';
import { getUpdateUserRoleNexts } from './getUpdateUserRoleNexts';
import { getDeleteUserRoleNexts } from './getDeleteUserRoleNexts';
import { getUsers } from './getUsers';
import { getUsersConnection } from './getUsersConnection';
import { getLogin } from './getLogin';
import { getCreateUser} from './getCreateUser';
import { getDeleteUser } from './getDeleteUser';
import { getUpdateUsers } from './getUpdateUsers';


export const getExamples = (api: SwaggerApi, lng: SupportLanguage ) => {
  switch(api) {
    case '/get-user-role-nexts':
      return getUserRoleNexts(lng);
    case '/get-user-role-nexts-connection':
      return getUserRoleNextsConnection(lng);
    case '/create-role':
      return getCreateUserRoleNexts(lng);
    case '/update-role':
      return getUpdateUserRoleNexts(lng);
    case '/delete-role':
      return getDeleteUserRoleNexts(lng);
    case '/get-users':
      return getUsers(lng)
    case '/get-users-connection':
      return getUsersConnection(lng)
    case '/login':
      return getLogin(lng)
    case '/create-user':
      return getCreateUser(lng);
    case '/delete-user':
      return getDeleteUser(lng)
    case '/update-user':
      return getUpdateUsers(lng)
    default:
      return undefined;
  }
};
