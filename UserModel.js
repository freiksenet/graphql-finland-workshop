const DataLoader = require("dataloader");

class UserModel {
  constructor(resource, userId) {
    this.resource = resource;
    this.userLoader = new DataLoader(ids => this.getByIds(ids));
    this.userId = userId;
  }

  async getAll() {
    return this.resource.query(`/users`);
  }

  async getById(id) {
    console.log(id);
    return this.userLoader.load(id);
  }

  async getByIds(ids) {
    const queryString = ids.map(id => `id=${id}`).join("&");
    const result = await this.resource.query(`/users?${queryString}`);
    return ids.map(id => result.find(user => user.id.toString() === id));
  }

  async getPrivate(user) {
    if (this.userId != user.id) {
      return null;
    } else {
      return {
        email: user.email,
        address: user.address,
        phone: user.phone,
        website: user.website,
        company: user.company
      };
    }
  }
}

module.exports = UserModel;
