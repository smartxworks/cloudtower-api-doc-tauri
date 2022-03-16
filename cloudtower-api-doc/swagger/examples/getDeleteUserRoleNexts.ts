import { GetExamplesFunc } from "./common";
import { RoleDeletionParams } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
import i18next from '../i18n';
export const getDeleteUserRoleNexts:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getDeleteUserRoleNexts_single', {lng})]: {
    description: "删除 id 为 `id-1` 的用户角色",
    value: {
      where: { id: "id-1"}
    } as RoleDeletionParams
  },
  [i18next.t('examples.getDeleteUserRoleNexts_multiple', {lng})]: {
    description: "删除 id 为 `id-1`、`id-2`、`id-3` 的用户角色",
    value: {
      where: { id_in: ["id-1","id-2", "id-3"]}
    } as RoleDeletionParams
  },
})