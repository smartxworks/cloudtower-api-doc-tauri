import { GetUserRoleNextsRequestBody } from '../../declerations/SwaggerCloudTowerAPI1.9.0'
import i18next from '../i18n';
import { GetExamplesFunc } from './common'

export const getUserRoleNexts:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUserRoleNexts_single', {lng})]: {
    description: "获取 id 为 user-id-1 的用户角色",
    value: {
      where: { id: "user-id-1 "}
    } as GetUserRoleNextsRequestBody
  },
  [i18next.t('examples.getUserRoleNexts_multiple', {lng})]: {
    description: "获取 id 值为 user-id-1, user-id-2 的用户角色",
    value: {
      where: { id_in: [
        "user-id-1",
        "user-id-2"
      ]}
    } as GetUserRoleNextsRequestBody
  },
  [i18next.t('examples.getUserRoleNexts_all', {lng})]: {
    value: {
      where: {}
    } as GetUserRoleNextsRequestBody
  },
  [i18next.t('examples.getUserRoleNexts_first', {lng})]: {
    description: "获取第一个用户角色，默认按创建时间的降序排序",
    value: {
      first: 1
    } as GetUserRoleNextsRequestBody
  },
})