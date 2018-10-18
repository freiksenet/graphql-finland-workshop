const DataLoader = require("dataloader");

class PostModel {
  constructor(resource, userId) {
    this.resource = resource;
    this.userId = userId;
    this.byIdLoader = new DataLoader(ids => this.getByIds(ids));
    this.byUserLoader = new DataLoader(ids => this.getAllByUserIds(ids));
  }

  async getAll() {
    return this.resource.query("/posts");
  }

  async getById(id) {
    return this.byIdLoader.load(id);
  }

  async getByIds(ids) {
    const queryString = ids.map(id => `id=${id}`).join("&");
    const result = await this.resource.query(`/posts?${queryString}`);
    return ids.map(id => result.find(post => post.id == id));
  }

  async getAllByUserId(userId) {
    return this.byUserLoader.load(userId);
  }

  async getAllByUserIds(userIds) {
    const queryString = userIds.map(userId => `userId=${userId}`).join("&");
    const result = await this.resource.query(`/posts?${queryString}`);
    return userIds.map(userId => result.filter(post => post.userId == userId));
  }

  async getAllByUserIdConnection(userId, { first, after }) {
    const result = await this.getAllByUserId(userId);
    return this.getAllConnection({ first, after }, result);
  }

  async update(post) {
    return this.resource.post(`/posts/${post.id}`, post);
  }

  async getAllConnection({ first, after }, result) {
    if (!result) {
      result = await this.resource.query("/posts");
    }
    let afterIndex;
    if (after) {
      afterIndex = result.findIndex(post => post.id == after) + 1;
    } else {
      afterIndex = 0;
    }
    let endIndex;
    if (first) {
      endIndex = afterIndex + first;
    } else {
      endIndex = result.length;
    }
    const nodes = result.slice(afterIndex, endIndex);
    const edges = nodes.map(node => ({
      cursor: node.id.toString(),
      node
    }));
    const pageInfo = {
      endCursor: edges[edges.length - 1].cursor,
      hasNextPage: endIndex < result.length
    };
    return {
      edges,
      pageInfo
    };
  }
}

module.exports = PostModel;
