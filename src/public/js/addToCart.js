
document.addEventListener("DOMContentLoaded", function () {
    const purchaseButton = document.getElementById("addToCart");

    purchaseButton.addEventListener("click", function () {
        obtenerIdsDesdeServidor()
            .then(ids => {
                const cartId = ids.cartId;
                const productId = ids.productId;
                window.location.href = "/api/carts/" + cartId + "/product/" + productId;
            })
            .catch(error => {
                console.error("Error al obtener IDs desde el servidor:", error);
            });
    });

    function obtenerIdsDesdeServidor() {
        return fetch("/api/carts/user-ids")
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo obtener la información desde el servidor");
                }
                return response.json();
            });
    }
});
