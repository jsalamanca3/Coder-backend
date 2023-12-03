import { usersModel } from "../models/users.model.js";
import BasicManager from "./basicManager.js";

class UsersManager extends BasicManager {
    constructor() {
        super(usersModel, 'Cart')
    }
}

export const usersManager = new UsersManager();