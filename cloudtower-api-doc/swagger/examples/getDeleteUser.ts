import { GetExamplesFunc } from "./common";
import { UserDeletionParams } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
import i18next from "i18next";
export const getDeleteUser:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getDeleteUsers_single', {lng})]: {
    value: {
      where: { id: "id-1"}
    } as UserDeletionParams
  },
  [i18next.t('examples.getDeleteUsers_single', {lng})]: {
    value: {
      where: { }
    } as UserDeletionParams
  }
})