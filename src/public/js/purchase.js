document.addEventListener("DOMContentLoaded", function () {
  const purchaseButton = document.getElementById("purchaseButton");

  if (purchaseButton) {
    purchaseButton.addEventListener("click", realizarCompra);
  } else {
    console.error("No se encontró el botón de compra con ID purchaseButton");
  }

  async function realizarCompra() {
    console.log("Hiciste clic en el botón de compra");

    try {
      const response = await fetch("/api/carts/active", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta del endpoint /api/carts/active:', data);

      if (!data.error) {
        const cartId = data.cart._id;

        const purchaseResponse = await fetch(`/api/carts/${cartId}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const purchaseData = await purchaseResponse.json();
        console.log('Respuesta del endpoint /api/carts/:cid/purchase:', purchaseData);
      } else {
        console.error('Error al obtener el carrito activo:', data.error);
      }
    } catch (error) {
      console.error('Error al realizar la compra:', error);
    }
  }
});