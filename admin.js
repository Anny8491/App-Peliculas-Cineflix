// Verificar sesión
document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      window.location.href = "auth.html";
    } else {
      // Mostrar nombre de usuario en el avatar
      const userAvatar = document.getElementById('userAvatar');
      if (userAvatar) {
        userAvatar.setAttribute('title', usuario.nombre);
      }
      
      // Cargar películas
      loadMovies();
    }
  });
  
  // Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "auth.html";
  });
  
  // Variables globales
  let currentMovieId = null;
  const apiUrl = '../api/peliculas/';
  const loadingOverlay = document.getElementById('loadingOverlay');
  const alertSuccess = document.getElementById('alertSuccess');
  const alertError = document.getElementById('alertError');
  
  // Cargar películas
  async function loadMovies() {
    showLoading();
    
    try {
      const response = await fetch(`${apiUrl}consultar.php`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las películas');
      }
      
      const movies = await response.json();
      displayMovies(movies);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error al cargar las películas. Por favor, intenta de nuevo.');
    } finally {
      hideLoading();
    }
  }
  
  // Mostrar películas en la tabla
  function displayMovies(movies) {
    const tableBody = document.getElementById('moviesTableBody');
    
    if (!movies || movies.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="loading">No hay películas disponibles</td></tr>';
      return;
    }
    
    let html = '';
    
    movies.forEach(movie => {
      html += `
        <tr>
          <td><img src="${movie.url_imagen}" alt="${movie.titulo}" onerror="this.src='https://via.placeholder.com/80x120?text=Sin+imagen'"></td>
          <td>${movie.titulo}</td>
          <td class="truncate">${movie.descripcion}</td>
          <td>$${parseFloat(movie.precio).toFixed(2)}</td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn" onclick="editMovie(${movie.id})"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" onclick="showDeleteConfirm(${movie.id})"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = html;
  }
  
  // Mostrar modal de formulario para agregar película
  document.getElementById('addMovieBtn').addEventListener('click', function() {
    resetForm();
    document.getElementById('formTitle').textContent = 'Agregar Película';
    document.getElementById('movieFormModal').style.display = 'block';
  });
  
  // Cerrar modal de formulario
  document.getElementById('closeFormModal').addEventListener('click', function() {
    document.getElementById('movieFormModal').style.display = 'none';
  });
  
  document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('movieFormModal').style.display = 'none';
  });
  
  // Vista previa de la imagen
  document.getElementById('url_imagen').addEventListener('input', function() {
    const imageUrl = this.value;
    const preview = document.getElementById('imagenPreview');
    
    if (imageUrl) {
      preview.src = imageUrl;
    } else {
      preview.src = 'https://via.placeholder.com/100x150?text=Vista+previa';
    }
  });
  
  // Enviar formulario
  document.getElementById('movieForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const movieData = {
      titulo: document.getElementById('titulo').value,
      descripcion: document.getElementById('descripcion').value,
      url_imagen: document.getElementById('url_imagen').value,
      precio: parseFloat(document.getElementById('precio').value),
      anio: parseInt(document.getElementById('anio').value),
      calificacion: parseFloat(document.getElementById('calificacion').value),
      duracion: parseInt(document.getElementById('duracion').value)
    };
    
    const movieId = document.getElementById('movieId').value;
    
    if (movieId) {
      // Actualizar película existente
      movieData.id = parseInt(movieId);
      await updateMovie(movieData);
    } else {
      // Crear nueva película
      await createMovie(movieData);
    }
  });
  
  // Crear película
  async function createMovie(movieData) {
    showLoading();
    
    try {
      const response = await fetch(`${apiUrl}crear.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        document.getElementById('movieFormModal').style.display = 'none';
        showAlert('success', 'Película agregada correctamente');
        loadMovies();
      } else {
        showAlert('error', result.message || 'Error al agregar la película');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error al agregar la película. Por favor, intenta de nuevo.');
    } finally {
      hideLoading();
    }
  }
  
  // Editar película
  function editMovie(id) {
    showLoading();
    
    fetch(`${apiUrl}consultar.php`)
      .then(response => response.json())
      .then(movies => {
        const movie = movies.find(m => m.id == id);
        
        if (movie) {
          document.getElementById('movieId').value = movie.id;
          document.getElementById('titulo').value = movie.titulo;
          document.getElementById('descripcion').value = movie.descripcion;
          document.getElementById('url_imagen').value = movie.url_imagen;
          document.getElementById('precio').value = movie.precio;
          document.getElementById('anio').value = movie.anio;
          document.getElementById('calificacion').value = movie.calificacion;
          document.getElementById('duracion').value = movie.duracion;
          
          // Actualizar vista previa de la imagen
          const preview = document.getElementById('imagenPreview');
          preview.src = movie.url_imagen || 'https://via.placeholder.com/100x150?text=Vista+previa';
          
          document.getElementById('formTitle').textContent = 'Editar Película';
          document.getElementById('movieFormModal').style.display = 'block';
        } else {
          showAlert('error', 'No se encontró la película');
        }
        
        hideLoading();
      })
      .catch(error => {
        console.error('Error:', error);
        showAlert('error', 'Error al cargar los datos de la película');
        hideLoading();
      });
  }
  
  // Actualizar película
  async function updateMovie(movieData) {
    showLoading();
    
    try {
      const response = await fetch(`${apiUrl}actualizar.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        document.getElementById('movieFormModal').style.display = 'none';
        showAlert('success', 'Película actualizada correctamente');
        loadMovies();
      } else {
        showAlert('error', result.message || 'Error al actualizar la película');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error al actualizar la película. Por favor, intenta de nuevo.');
    } finally {
      hideLoading();
    }
  }
  
  // Mostrar confirmación de eliminación
  function showDeleteConfirm(id) {
    currentMovieId = id;
    document.getElementById('deleteConfirmModal').style.display = 'block';
  }
  
  // Cancelar eliminación
  document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    currentMovieId = null;
  });
  
  // Confirmar eliminación
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (currentMovieId) {
      deleteMovie(currentMovieId);
    }
  });
  
  // Eliminar película
  async function deleteMovie(id) {
    showLoading();
    
    try {
      const response = await fetch(`${apiUrl}eliminar.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        document.getElementById('deleteConfirmModal').style.display = 'none';
        showAlert('success', 'Película eliminada correctamente');
        loadMovies();
      } else {
        showAlert('error', result.message || 'Error al eliminar la película');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error al eliminar la película. Por favor, intenta de nuevo.');
    } finally {
      hideLoading();
      currentMovieId = null;
    }
  }
  
  // Resetear formulario
  function resetForm() {
    document.getElementById('movieForm').reset();
    document.getElementById('movieId').value = '';
    document.getElementById('imagenPreview').src = 'https://via.placeholder.com/100x150?text=Vista+previa';
  }
  
  // Mostrar alerta
  function showAlert(type, message) {
    const alert = type === 'success' ? alertSuccess : alertError;
    alert.textContent = message;
    alert.style.display = 'block';
    
    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      alert.style.display = 'none';
    }, 5000);
  }
  
  // Mostrar overlay de carga
  function showLoading() {
    loadingOverlay.style.display = 'flex';
  }
  
  // Ocultar overlay de carga
  function hideLoading() {
    loadingOverlay.style.display = 'none';
  }
  
  // Cerrar modales al hacer clic fuera del contenido
  window.addEventListener('click', function(event) {
    const formModal = document.getElementById('movieFormModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    
    if (event.target === formModal) {
      formModal.style.display = 'none';
    }
    
    if (event.target === deleteModal) {
      deleteModal.style.display = 'none';
      currentMovieId = null;
    }
  });