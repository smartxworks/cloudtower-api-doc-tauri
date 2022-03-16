import { GetExamplesFunc } from "./common";
import {  UserUpdationParams } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
import i18next from "../i18n";
export const getUpdateUsers:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUpdateUsers_single', {lng})]: {
    description: "更新 id 为 id-1 的用户， 将名称改为 'new name'",
    value: {
      where: { id: "id-1" },
      data: {
        name: "new name"
      }
    } as UserUpdationParams
  },
  [i18next.t('examples.getUpdateUsers_multiple')]: {
    description: "将名称中包含 test 的用户的名称改为 'sprint1-test'",
    value: {
      where: { name_contains: "test"},
      data: {
        name: "sprint1-test"
      }
    } as UserUpdationParams
  }
})