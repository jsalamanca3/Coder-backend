import { usersModel } from "../models/users.model.js";
import BasicManager from "./basicManager.js";

class UsersManager extends BasicManager {
    constructor() {
        super(usersModel, 'Cart')
    };
    async findInactiveUsers(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const inactiveUsers = await usersModel.find({
          last_connection: { $lt: cutoffDate },
        });
        return inactiveUsers;
      }
    async deleteInactiveUsers(users) {
        const userIds = users.map(user => user._id);
        await usersModel.deleteMany({ _id: { $in: userIds } });
      }
}

export const usersManager = new UsersManager();