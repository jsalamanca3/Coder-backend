export default class userDTO  {
    constructor(obj) {
        this.full_name = `${obj.first_name} ${obj.last_name}`;
        this.email = obj.email;
        this.password = obj.password;
    }
}