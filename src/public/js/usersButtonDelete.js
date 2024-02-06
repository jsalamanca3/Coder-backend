function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        fetch(`/users/${userId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                alert('Error al eliminar el usuario');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el usuario:', error);
            alert('Error al eliminar el usuario');
        });
    }
};