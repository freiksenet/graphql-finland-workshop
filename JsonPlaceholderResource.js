const fetch = require("node-fetch");

class JsonPlaceholderResource {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async query(resource) {
    console.log(resource);
    const result = await fetch(`${this.apiUrl}${resource}`);
    if (result.status === 200) {
      return result.json();
    } else {
      throw new Error(`Error querying REST API, url: ${resource}`);
    }
  }

  async post(resource, payload) {
    const result = await fetch(`${this.apiUrl}${resource}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (result.status === 200) {
      const resultJson = await result.json();
      console.log(resultJson);

      return resultJson;
    } else {
      console.log(await result.text());
      throw new Error(`Error querying REST API, url: ${resource}`);
    }
  }
}

module.exports = JsonPlaceholderResource;
