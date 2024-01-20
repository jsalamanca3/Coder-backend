import { assert, expect, should } from 'chai';  // Using Assert style
import supertest from 'supertest';
import { cartsModel } from '../src/persistencia/dao/models/carts.model.js';
import { productsModel } from '../src/persistencia/dao/models/products.model.js';
import * as app from "../src/app.js";

const api = supertest("http://localhost:8080");

describe('Carts Router', () => {
  let testCart;
  let testProduct;

  before(async () => {//setup
    // Crear un carrito y un producto de prueba antes de ejecutar las pruebas
    testCart = await cartsModel.create({ _id: '658f8a8e5d69a23f47582bb4', products: [] });
    testProduct = await productsModel.create({
      title: 'Producto de Prueba',
      price: 19.99,
      category: 'Electrónicos',
      stock: 10,
      thumbnails: 'url_de_thumbnails',
      code: 'ABC123',
    });
  });

  after(async () => { //teardown
    await cartsModel.deleteMany({});
    await productsModel.deleteMany({});
  });

  it('should create a new cart', async () => {
    const existingUserId = "658f8a8e5d69a23f47582bb4";
    const newCartData = {
      user: existingUserId,
};
    const response = await api.post('/api/carts/create').send(newCartData);
    expect(response.status).to.equal(201);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('user', existingUserId);
  });

  it('should get the active cart', async () => {
    const response = await api.get('/api/carts/active');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('cart');
  });

  it('should add a product to the cart', async () => {
    const response = await api.post(`/api/carts/${testCart.id}/product/${testProduct._id}`).send({ quantity: 2 });
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.products).to.be.an('array').that.is.not.empty;
  });

  it('should get details of a product in the cart', async () => {
    const response = await api.get(`/api/carts/${testCart.id}/product/${testProduct._id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('product');
  });

  it('should delete a product from the cart', async () => {
    const response = await api.delete(`/api/carts/${testCart.id}/products/${testProduct._id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.products).to.be.an('array').that.is.empty;
  });

  it('should delete a cart', async () => {
    const response = await api.delete(`/api/carts/${testCart.id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.id).to.equal(testCart.id);
    expect(response.body.products).to.not.include(testProduct._id);
  });

  it('should purchase products from the cart', async () => {
    // Asegúrate de tener productos en el carrito antes de ejecutar esta prueba
    // (puedes agregar productos al carrito en una prueba anterior)
    const response = await api.post(`/api/carts/${testCart.id}/purchase`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('message', 'Compra completada con éxito');
  });
});
