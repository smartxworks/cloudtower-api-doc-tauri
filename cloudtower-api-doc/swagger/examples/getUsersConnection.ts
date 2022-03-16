import i18next from "../i18n";
import { GetExamplesFunc } from "./common";
import { GetUsersRequestBody } from '../../declerations/SwaggerCloudTowerAPI1.9.0';

export const getUsersConnection:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUsersConnection_all', {lng})]: {
    description: "获取全部用户数量",
    value : {
      where: {}
    } as GetUsersRequestBody
  },
  [i18next.t('examples.getUsersConnection_condition', {lng})]: {
    description: "获取用户名中包含 `test` 的所有用户数量",
    value : {
      where: {
        username_contains: "test"
      }
    } as GetUsersRequestBody
  }
})