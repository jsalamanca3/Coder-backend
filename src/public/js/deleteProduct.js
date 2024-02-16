function deleteProduct(productId) {
  fetch(`/api/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        alert("El producto ha sido eliminado correctamente.");
        location.reload();
      } else {
        alert("Error al eliminar el producto.");
      }
    })
    .catch((error) => {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto.");
    });
}
