import { assert, expect, should } from 'chai';  // Using Assert style
import supertest from 'supertest';
import * as app from "../src/app.js";

const api = supertest("http://localhost:8080");



describe('Sessions Router', () => {
  it('should sing up a new user', async () => {
    const userData = {
      first_name: 'Nuevo Usuario',
      last_name: 'gt',
      email: 'nuevo_usuario@example.com',
      password: 'contraseña123',
    };

    const response = await api.post('/api/login/signup').send(userData);
    expect(response.statusCode).to.equal(302);
  });

  it('should log in an existing user', async () => {
    const credentials = {
      email: 'nuevo_usuario@example.com',
      password: 'contraseña123',
    };

    const response = await api.post('/api/login').send(credentials);
    expect(response.statusCode).to.equal(302);
  });

  it('should redirect to GitHub for authentication', async () => {
    const response = await api.get('/api/sessions/auth/github');
    expect(response.statusCode).to.equal(302);
  });

  it('should handle GitHub authentication callback', async () => {
    const response = await api.get('/api/sessions/github');
    expect(response.statusCode).to.equal(302);
  });

  // Prueba para POST /register (JWT Token)
  it('should register a new user and return a JWT token', async () => {
    const userData = {
      first_name: 'Nuevo Usuario',
      last_name: 'gt',
      email: 'nuevo2_usuario@example.com',
      password: 'contraseña1232',
    };

    const response = await api.post('/api/sessions/register').send(userData);
    expect(response.statusCode).to.equal(200);
    expect(response._body).to.have.property('status').equal('success');
    expect(response._body).to.have.property('access_token');
  });

  it('should redirect to Google for authentication', async () => {
    const response = await api.get('/api/sessions/auth/google');
    expect(response.statusCode).to.equal(302);
  });

  it('should handle Google authentication callback', async () => {
    const response = await api.get('/api/sessions/auth/google/callback');
    expect(response.statusCode).to.equal(302);
  });
});
