import { GetExamplesFunc } from "./common";
import {  GetUserRoleNextsRequestBody, UserRolePlatform } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
import i18next from "i18next";

export const getUserRoleNextsConnection:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUserRoleNextsConnection_all')]: {
    value: {
      where: {}
    } as GetUserRoleNextsRequestBody
  },
  [i18next.t('examples.getUserRoleNextsConnection_condition')]: {
    description: "获取在 tower 平台上创建的所有用户角色",
    value: {
      where: {
        platform: UserRolePlatform.MANAGEMENT
      }
    } as GetUserRoleNextsRequestBody
  }
})