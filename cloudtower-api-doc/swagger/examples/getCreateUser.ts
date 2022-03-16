import { GetExamplesFunc } from "./common";
import { UserCreationParams } from '../../declerations/SwaggerCloudTowerAPI1.9.0';
export const getCreateUser:GetExamplesFunc = (lng) => ({
  '': {
    description: "创建用户名为 new-user, 昵称为 new-user-name，密码为 111111， 用户角色所属角色 id 为 1 的用户",
    value: [
      { role_id: "id-1", name: "new-user", username: "new-user-name", password: "111111" }
    ] as UserCreationParams[]
  }
})