import { assert, expect, should } from 'chai';  // Using Assert style
import supertest from 'supertest';
import { productsModel } from '../src/persistencia/dao/models/products.model.js';
import * as app from "../src/app.js";

const api = supertest("http://localhost:8080");

describe('Products Router', () => {
  let existingProduct;

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
  });

  after(async () => {
    await productsModel.deleteMany({});
  });

  it('should return a list of products', async () => {
    const response = await api.get('/api/products');
    console.log(response);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('status', 'success');
    expect(response._body).to.have.property('payload').that.is.an('array');
  });

  it('should return a specific product by ID', async () => {
    const response = await api.get(`/api/products/${existingProduct._id}`);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('title', existingProduct.title);
  });

  it('should create a new product', async () => {
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

    const response = await api.post('/api/products').send(newProductData);
    expect(response.statusCode).to.equal(201);
    expect(response._body).to.be.an('object');
    expect(response._body).to.have.property('title', newProductData.title);
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
clearInterval