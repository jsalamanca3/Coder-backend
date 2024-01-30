import { assert, expect, should } from 'chai';  // Using Assert style
import supertest from 'supertest';
import { productsModel } from '../src/persistencia/dao/models/products.model.js';
import * as app from "../src/app.js";
import logger from '../src/winston.js';


const api = supertest("http://localhost:8080");

describe('Products Router', () => {
  let existingProduct;
  let authToken;

  before(async () => {
    existingProduct = await productsModel.create({
      title: 'Producto Prueba',
      description: 'soy una descripción de la prueba',
      code: '12345',
      price: 19.99,
      status: 'available',
      stock: 60,
      category: 'Electrónicos',
      thumbnails: 'url_de_thumbnails',
    });

    const userCredentials = {
      email: 'ale@gmail.com',
      password: '123456780',
    };

    const loginResponse = await api.post('/api/login').send(userCredentials);

    authToken = loginResponse.body.token;
  });

  it('should return a list of products', async () => {
    try {
      const response = await api.get('/api/products');
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('status', 'success');
      expect(response.body).to.have.property('payload').that.is.an('array');
    } catch (error) {
      logger.error('Error:', error);
    }
  });

  it('should return a specific product by ID', async () => {
    const response = await api.get(`/api/products/${existingProduct._id}`);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('title', existingProduct.title);
  });

  it('should create a new product', async () => {
    console.log('soy el enpoint')
    const newProductData = {
      title: 'Nuevo Producto',
      description: 'soy una descripción',
      code: '12345',
      price: 19.99,
      status: 'available',
      stock: 60,
      category: 'Electrónicos',
      thumbnails: 'url_de_thumbnails',
    };

    console.log(newProductData);

    const response = await api.post('/api/createproduct/').set('Authorization', `Bearer ${authToken}`).send(newProductData);
    console.log(authToken);
    expect(response.statusCode).to.equal(201);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('title', newProductData.title);
  });

  it('should update an existing product', async () => {
    const updatedProductData = {
      title: 'Producto Actualizado',
      price: 39.99,
      category: 'Nuevas Categorías',
    };

    const response = await api.put(`/api/products/${existingProduct._id}`).send(updatedProductData);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('title', updatedProductData.title);
    expect(response._body).to.have.property('price', updatedProductData.price);
    expect(response._body).to.have.property('category', updatedProductData.category);
  });

  it('should delete an existing product', async () => {
    const response = await api.delete(`/api/products/${existingProduct._id}`);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('message', 'Producto eliminado exitosamente');
  });
});