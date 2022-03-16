import { GetExamplesFunc } from "./common";
import { LoginInput, UserSource } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
export const getLogin:GetExamplesFunc = (lng) => ({
  "": {
    value: {
      username: "root",
      password: "1111",
      source: UserSource.LOCAL
    } as LoginInput,
    description: "登录用户名为 root， 密码为 111111 的用户。source 为 tower 平台创建的用户。"
  }
})