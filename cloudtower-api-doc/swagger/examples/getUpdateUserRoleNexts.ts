import { RoleUpdationParams } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
import { GetExamplesFunc } from './common';
import i18next from '../i18n';

export const getUpdateUserRoleNexts:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUpdateUserRoleNexts_single', {lng})]: {
    description: "将 id 为 `id-1` 的用户角色名称更新为 new-role-name",
    value: {
      where: { id: "id-1" },
      data: {
        name: "new-role-name"
      }
    } as RoleUpdationParams
  },
  [i18next.t('examples.getUpdateUserRoleNexts_multiple', {lng})]: {
    description: "将 id 为 `id-1`、 `id-2`、`id-3`的用户角色名称更新为 new-role-name",
    value: {
      where: {
        id_in: ["id-1", "id-2", "id-3"],
      },
      data: {
        name: "new-role-name",
      }
    } as RoleUpdationParams
  } 
})