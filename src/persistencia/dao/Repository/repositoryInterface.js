class RepositoryInterface {
    async create(entity) {}
    async findById(id) {}
    async update(id, updatedEntity) {}
    async delete(id) {}
  }
export default RepositoryInterface;