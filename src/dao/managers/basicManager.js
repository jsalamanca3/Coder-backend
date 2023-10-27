export default class BasicManager {
    constructor(model){
        this.model = model
    }

    async findAll() {
        return this.model.find().lean();
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async createOne(obj) {
        return this.model.create(obj);
    }
    async updateOne(id, obj) {
        return this.model.updateOne({_id: id }, obj);
    }
    async deleteOne(id) {
        return this.model.deleteOne({_id: id});
    }
    async findByFirstName(firstName) {
        return this.model.find({ first_name: firstName }).lean();
    }
    async findByEmail(email) {
        return this.model.find({ email: email }).lean();
    }Gi
}