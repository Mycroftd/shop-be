const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const seed = require("../test-data/mongoSeed");

beforeEach(async () => {
  await seed();
});

afterAll(() => {
  mongoose.connection.close();
});

describe("path not found", () => {
  test("passed an invalid path returns 404 msg", () => {
    return request(app)
      .get("/api/banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("path not found");
      });
  });
});

describe("GET /api/categories", () => {
  test("status 200, returns all categories", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        expect(body.categories.length).toBe(5);
      });
  });
});

describe("GET /api/products", () => {
  test("status 200, returns all products with no category", () => {
    return request(app)
      .get("/api/products")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(20);
      });
  });
  test("status 200, if given a category only returns the category", () => {
    return request(app)
      .get("/api/products?category=men's clothing")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(4);
      });
  });
  test("status 404, if category doesn't exist", () => {
    return request(app)
      .get("/api/products?category=banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("category not found");
      });
  });
  test("status 200, if category exist but no products", () => {
    return request(app)
      .get("/api/products?category=children's clothing")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(0);
      });
  });
  test("status 200, if orderby only 1 given, orders results by rating ascending", () => {
    const ratingRate = (a, b) => {
      return a.rate - b.rate;
    };

    return request(app)
      .get("/api/products?order=1")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(20);
        expect(body.products).toBeSortedBy("rating", {
          compare: ratingRate,
          descending: false,
        });
      });
  });
  test("status 200, if orderby only -1 given orders results by rating descending", () => {
    const ratingRate = (a, b) => {
      return a.rate - b.rate;
    };

    return request(app)
      .get("/api/products?order=-1")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(20);
        expect(body.products).toBeSortedBy("rating", {
          compare: ratingRate,
          descending: true,
        });
      });
  });
  test("status 400, if invalid orderby given", () => {
    return request(app)
      .get("/api/products?order=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid order");
      });
  });
  test("status 200, if given valid sortby", () => {
    return request(app)
      .get("/api/products?sortby=price")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(20);
        expect(body.products).toBeSortedBy("price", {
          descending: false,
        });
      });
  });
  test("status 400,  invalid sort by error", () => {
    return request(app)
      .get("/api/products?sortby=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid sort by");
      });
  });
  test("status 200, a complex query with all three parameters", () => {
    return request(app)
      .get("/api/products?category=men's clothing&sortby=price&order=-1")
      .expect(200)
      .then(({ body }) => {
        expect(body.products.length).toBe(4);
        expect(body.products).toBeSortedBy("price", {
          descending: true,
        });
      });
  });
});

describe("GET /api/products/:product_id", () => {
  test("status 200, returns correct product", () => {
    return request(app)
      .get("/api/products/4")
      .expect(200)
      .then(({ body }) => {
        expect(body.product).toMatchObject({
          id: 4,
          title: "Mens Casual Slim Fit",
          price: 15.99,
          description:
            "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
          category: "men's clothing",
          image: "/img/4.jpg",
          rating: { rate: 2.1, count: 430 },
        });
      });
  });
  test("status 400, if given a invalid product id", () => {
    return request(app)
      .get("/api/products/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid product id");
      });
  });
  test("status 404, if given a valid product id that doesn't exist", () => {
    return request(app)
      .get("/api/products/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("product not found");
      });
  });
});

describe("POST /api/products", () => {
  test("status 201, when a valid product id and data given", () => {
    return request(app)
      .post("/api/products")
      .send({
        title: "test Product",
        price: 10.0,
        description: "test description",
        category: "electronics",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.product).toMatchObject({
          id: 21,
          title: "test Product",
          price: 10,
          description: "test description",
          category: "electronics",
          image: "/img/21.jpg",
          rating: {
            rate: 0,
            count: 0,
          },
        });
      });
  });
  test("status 201, when a valid product id and data given but ignore extra properties", () => {
    return request(app)
      .post("/api/products")
      .send({
        title: "test Product",
        price: 10.0,
        description: "test description",
        category: "electronics",
        time: 100,
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.product).toMatchObject({
          id: 21,
          title: "test Product",
          price: 10,
          description: "test description",
          category: "electronics",
          image: "/img/21.jpg",
          rating: {
            rate: 0,
            count: 0,
          },
        });
      });
  });
  test("status 400 if body doesn't contain a needed property", () => {
    return request(app)
      .post("/api/products")
      .send({
        title: "test Product",
        description: "test description",
        category: "electronics",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("needs all data");
      });
  });
  test("status 400 if body doesn't any json data", () => {
    return request(app)
      .post("/api/products")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("needs all data");
      });
  });
  test("status 400 if price is less than 0.01", () => {
    return request(app)
      .post("/api/products")
      .send({
        title: "test Product",
        price:-1,
        description: "test description",
        category: "electronics",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid price");
      });
  });
  test("status 400 if price is invalid", () => {
    return request(app)
      .post("/api/products")
      .send({
        title: "test Product",
        price:"banana",
        description: "test description",
        category: "electronics",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid price");
      });
  });
});

describe("POST /api/categories", () => {
  test("status 201, when a valid name given", () => {
    return request(app)
      .post("/api/categories")
      .send({
        name: "test category",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.category).toMatchObject({
          name: "test category",
        });
      });
  });
  test("status 201, when a valid name given but extra properties", () => {
    return request(app)
      .post("/api/categories")
      .send({
        name: "test category",
        user: "test",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.category).toMatchObject({
          name: "test category",
        });
      });
  });
  test("status 400 if body doesn't any json data", () => {
    return request(app)
      .post("/api/categories")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("needs all data");
      });
  });
  test("status 400 if category already exists", () => {
    return request(app)
      .post("/api/categories")
      .send({ name: "electronics" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("category already exists");
      });
  });
});

describe("PATCH /api/products", () => {
  test("status 200 if rate and count increase correctly", () => {
    return request(app)
      .patch("/api/products/8")
      .send({ rate: 1.9 })
      .expect(200)
      .then(({ body }) => {
        expect(body.product).toMatchObject({
          id: 8,
          title: "Pierced Owl Rose Gold Plated Stainless Steel Double",
          price: 10.99,
          description:
            "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel",
          category: "jewelery",
          image: "/img/8.jpg",
          rating: { rate: 1.9, count: 101 },
        });
      });
  });
  test("status 404 if product id is valid not doesn't exist", () => {
    return request(app)
      .patch("/api/products/1000")
      .send({ rate: 1.9 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("product doesn't exist");
      });
  });
  test("status 400 if invalid product id", () => {
    return request(app)
      .patch("/api/products/banana")
      .send({ rate: 1.9 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid product id");
      });
  });
  test("status 400 if no body given", () => {
    return request(app)
      .patch("/api/products/4")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid rating");
      });
  });
  test("status 400 if invalid rating given", () => {
    return request(app)
      .patch("/api/products/4")
      .send({ rate: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid rating");
      });
  });
  test("status 400 if invalid rating greater than 5", () => {
    return request(app)
      .patch("/api/products/4")
      .send({ rate: 6 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("rating must be between 1 and 5");
      });
  });
  test.only("status 400 if invalid rating less than 1", () => {
    return request(app)
      .patch("/api/products/4")
      .send({ rate: 0 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("rating must be between 1 and 5");
      });
  });
});
