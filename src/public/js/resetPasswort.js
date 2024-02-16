document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resetPasswordBtn').addEventListener('click', function () {
      const newPassword = document.getElementsByName('newPassword')[0].value;
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const resetToken = params.token;

      if (!resetToken) {
        console.error('No se encontró el resetToken en la URL');
        return;
      }
      fetch('/api/login/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          resetToken,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.success) {
            alert('Contraseña restablecida exitosamente');
            window.location.href = '/login';
          } else {
            alert('Hubo un problema al restablecer la contraseña');
          }
        })
        .catch(error => console.error('Error:', error));
    });
  });
