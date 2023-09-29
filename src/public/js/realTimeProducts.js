// main.js
const socket = io();
const productList = document.getElementById('productList');
const addProductForm = document.getElementById('addProductForm');
const deleteProductForm = document.getElementById('deleteProductForm');
productList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-button')) {
    const productId = e.target.dataset.productId;
    socket.emit('deleteProduct', productId);
  }
});
socket.on('productAdded', (newProduct) => {
  const newItem = document.createElement('li');
  newItem.textContent = newProduct.title;
  newItem.dataset.productId = newProduct.id;
  productList.appendChild(newItem);
});
socket.on('productDeleted', (productId) => {
  const productItem = document.querySelector(`li[data-product-id="${productId}"]`);
  if (productItem) {
    productItem.remove();
  }
});
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productTitleInput = addProductForm.querySelector('[name="title"]');
  const newProduct = {
    name: productTitleInput.value,
  };
  socket.emit('addProduct', newProduct);
  productTitleInput.value = '';
});
deleteProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productIdInput = deleteProductForm.querySelector('[name="id"]');
  const productId = productIdInput.value;
  socket.emit('deleteProduct', productId);
  productIdInput.value = '';
});

fetch('/addProduct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Producto 1',
    price: 100,
  }),
});