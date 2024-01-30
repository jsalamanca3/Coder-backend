function uploadDocuments() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);
    const userId = '123'; // Reemplaza con el ID del usuario actual

    fetch(`/api/users/${userId}/documents`, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Puedes manejar la respuesta del servidor aquí
    })
    .catch(error => {
        console.error(error);
        // Puedes manejar errores aquí
    });
}
