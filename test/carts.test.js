import { assert, expect, should } from "chai";
import supertest from "supertest";
import sinon from "sinon";
import * as app from "../src/app.js";
import { cartsModel } from "../src/persistencia/dao/models/carts.model.js";
import { usersModel } from "../src/persistencia/dao/models/users.model.js";
import { ticketModel } from "../src/persistencia/dao/models/ticket.model.js";
import nodemailer from "nodemailer";
import logger from "../src/winston.js";

const api = supertest("http://localhost:8080");

describe("GET /active", () => {
  it("should return a 401 status for unauthenticated user", async () => {
    const response = await api.get("/api/carts/active");
    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property("error");
  });
});


describe("POST /", () => {
  it("should create a new cart and return 201 status", async () => {
    const userId = "658ffeb938485a1671a87b4a";

    const cartsModelStub = sinon.stub(cartsModel.prototype, "save").callsFake(async function() {
      this._id = userId;
      this.products = [];
      this.user = userId;
      return this;
    });

    const response = await api.post("/api/carts/").send();
    expect(response.statusCode).to.equal(201);
    expect(response.body).to.have.property("_id").to.equal(userId);

    cartsModelStub.restore();
  });
});

describe("POST /:cid/purchase", () => {
  it("should process the purchase and return 200 status", async () => {
    const cartId = "658ffeb938485a1671a87b4d";
    const userEmail = "chizatonishikigi@gmail.com";

    const cartsModelStub = sinon.stub(cartsModel, "findOne").resolves({
      _id: cartId,
      user: "658ffeb938485a1671a87b4a",
      products: [
        { product: { _id: "65abbb706fe2f3163e3d9a01", stock: 10 }, quantity: 2 },
        { product: { _id: "65abbbdbf4228e7341316d7d", stock: 5 }, quantity: 1 },
      ],
    });

    const usersModelStub = sinon.stub(usersModel, "findOne").resolves({
      _id: "658ffeb938485a1671a87b4a",
      email: userEmail,
    });

    const transporterStub = sinon.stub(nodemailer, "createTransport").returns({
      sendMail: (options, callback) => {
        callback(null, { response: "Email sent successfully" });
      },
    });

    const ticketModelStub = sinon.stub(ticketModel.prototype, "save").resolves({
      code: "12",
      purchase_datetime: new Date(),
      amount: 50,
      purchaser: userEmail,
      products: [
        { product: { _id: "product_id_1", name: "Product 1" }, quantity: 2 },
        { product: { _id: "product_id_2", name: "Product 2" }, quantity: 1 },
      ],
    });

    try {
      const response = await api.post(`/api/carts/${cartId}/purchase`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message").to.equal("Compra completada con éxito");
    } catch (error) {
      logger.error("Error en el endpoint /api/carts/:cid/purchase:", error);
    } finally {
      cartsModelStub.restore();
      usersModelStub.restore();
      transporterStub.restore();
      ticketModelStub.restore();
    }
  });
});
