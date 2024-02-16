document.addEventListener('DOMContentLoaded', () => {
    const deleteUserButton = document.getElementById('deleteUserButton');

    deleteUserButton.addEventListener('click', async () => {
      const userId = deleteUserButton.getAttribute('data-user-id');

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          console.log('Usuario eliminado correctamente');
        } else {
          console.error('Error al eliminar usuario:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    });
  });