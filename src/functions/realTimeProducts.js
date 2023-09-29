const socketClient = io('/api');

const productList = document.getElementById('productList');
const addProductForm = document.getElementById('addProductForm');
const deleteProductForm = document.getElementById('deleteProductForm');

productList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-button')) {
    const productId = e.target.dataset.productId;
    socketClient.emit('deleteProduct', productId);
  }
});

socketClient.on('productAdded', (newProduct) => {
  const newItem = document.createElement('li');
  newItem.textContent = newProduct.title;
  newItem.dataset.productId = newProduct.id;
  productList.appendChild(newItem);
});

socketClient.on('productDeleted', (productId) => {
  const productItem = document.querySelector(`li[data-product-id="${productId}"]`);
  if (productItem) {
    productItem.remove();
  }
});

addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productTitleInput = addProductForm.querySelector('[name="title"]');
  const newProduct = {
    title: productTitleInput.value,
  };
  socketClient.emit('addProduct', newProduct);
  productTitleInput.value = '';
});

deleteProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productIdInput = deleteProductForm.querySelector('[name="id"]');
  const productId = productIdInput.value;
  socketClient.emit('deleteProduct', productId);
  productIdInput.value = '';
});
