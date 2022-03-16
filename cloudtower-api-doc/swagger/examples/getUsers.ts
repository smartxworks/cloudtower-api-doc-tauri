import i18next from "../i18n";
import { GetExamplesFunc } from "./common";
import { GetUsersRequestBody} from '../../declerations/SwaggerCloudTowerAPI1.9.0';

export const getUsers:GetExamplesFunc = (lng) => ({
  [i18next.t('examples.getUsers_single', {lng})]: {
    description: "获取 id 为 `id-1` 的用户信息",
    value:  {
      where: { id: "id-1" }
    } as GetUsersRequestBody
  },
  [i18next.t('examples.getUsers_multiple', {lng})]: {
    description: "获取用户名中包含 test 的用户信息",
    value:  {
      where: { name_contains: "test" }
    } as GetUsersRequestBody
  }
})