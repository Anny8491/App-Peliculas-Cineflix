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
    }
  
    // Inicializar la aplicación
    initApp();
  });
  
  // Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "auth.html";
  });
  
  // Efecto de scroll en la barra de navegación
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Películas de ejemplo (en caso de que la API no funcione)
  const sampleMovies = [
    {
      id: 1,
      titulo: "Avengers: Endgame",
      descripcion: "Después de los devastadores eventos de Avengers: Infinity War, el universo está en ruinas. Con la ayuda de los aliados restantes, los Vengadores se reúnen una vez más para revertir las acciones de Thanos y restaurar el equilibrio del universo.",
      url_imagen: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
      precio: 9.99,
      anio: 2019,
      calificacion: 8.4,
      duracion: 181
    },
    {
      id: 2,
      titulo: "The Dark Knight",
      descripcion: "Batman se enfrenta a su mayor desafío cuando el Joker aterroriza Gotham City. Con la ayuda del teniente Jim Gordon y el fiscal del distrito Harvey Dent, Batman intenta desmantelar las organizaciones criminales que plagan las calles.",
      url_imagen: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      precio: 8.99,
      anio: 2008,
      calificacion: 9.0,
      duracion: 152
    },
    {
      id: 3,
      titulo: "Inception",
      descripcion: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños, se le da la tarea inversa de plantar una idea en la mente de un CEO, pero su pasado trágico puede condenar el proyecto y a su equipo al desastre.",
      url_imagen: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      precio: 7.99,
      anio: 2010,
      calificacion: 8.8,
      duracion: 148
    },
    {
      id: 4,
      titulo: "Interstellar",
      descripcion: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de garantizar la supervivencia de la humanidad.",
      url_imagen: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      precio: 8.99,
      anio: 2014,
      calificacion: 8.6,
      duracion: 169
    },
    {
      id: 5,
      titulo: "Pulp Fiction",
      descripcion: "Las vidas de dos sicarios, un boxeador, la esposa de un gángster y un par de bandidos se entrelazan en cuatro historias de violencia y redención.",
      url_imagen: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      precio: 6.99,
      anio: 1994,
      calificacion: 8.9,
      duracion: 154
    }
  ];
  
  // Inicializar la aplicación
  function initApp() {
    // Cargar películas desde la API
    fetchMovies();
    
    // Configurar el banner principal con la primera película
    setupBanner();
  }
  
  // Obtener películas desde la API
  async function fetchMovies() {
    try {
      const response = await fetch('../api/peliculas/consultar.php');
      
      if (!response.ok) {
        throw new Error('Error al cargar las películas');
      }
      
      let movies = await response.json();
      
      // Si no hay películas en la API, usar las de ejemplo
      if (!movies || movies.length === 0) {
        movies = sampleMovies;
        
        // Intentar guardar las películas de ejemplo en la base de datos
        sampleMovies.forEach(async (movie) => {
          try {
            await fetch('../api/peliculas/crear.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(movie)
            });
          } catch (error) {
            console.error('Error al guardar película de ejemplo:', error);
          }
        });
      }
      
      // Mostrar las películas en las diferentes secciones
      displayMovies(movies, 'popularMovies');
      
      // Dividir las películas para las diferentes secciones
      const halfLength = Math.ceil(movies.length / 2);
      const firstHalf = movies.slice(0, halfLength);
      const secondHalf = movies.slice(halfLength);
      
      displayMovies(firstHalf, 'actionMovies');
      displayMovies(secondHalf, 'dramaMovies');
      
    } catch (error) {
      console.error('Error:', error);
      
      // Si hay un error, mostrar las películas de ejemplo
      displayMovies(sampleMovies, 'popularMovies');
      
      const halfLength = Math.ceil(sampleMovies.length / 2);
      const firstHalf = sampleMovies.slice(0, halfLength);
      const secondHalf = sampleMovies.slice(halfLength);
      
      displayMovies(firstHalf, 'actionMovies');
      displayMovies(secondHalf, 'dramaMovies');
    }
  }
  
  // Mostrar películas en una sección
  function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <img src="${movie.url_imagen}" alt="${movie.titulo}" onerror="this.src='https://via.placeholder.com/300x450?text=Imagen+no+disponible'">
        <div class="movie-info">
          <h3 class="movie-title">${movie.titulo}</h3>
          <div class="movie-meta">
            <span>${movie.anio || '2023'}</span>
            <span><i class="fas fa-star"></i> ${movie.calificacion || '8.5'}</span>
          </div>
        </div>
        <div class="movie-overlay">
          <div class="movie-overlay-buttons">
            <button onclick="openMovieModal(${movie.id})"><i class="fas fa-info"></i></button>
            <button><i class="fas fa-play"></i></button>
            <button><i class="fas fa-plus"></i></button>
          </div>
        </div>
      `;
      
      movieCard.addEventListener('click', () => openMovieModal(movie.id));
      container.appendChild(movieCard);
    });
  }
  
  // Configurar el banner principal
  function setupBanner() {
    const heroBanner = document.getElementById('heroBanner');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerDescription = document.getElementById('bannerDescription');
    
    // Usar la primera película como banner principal
    let featuredMovie;
    
    try {
      // Intentar obtener películas desde la API
      fetch('../api/peliculas/consultar.php')
        .then(response => response.json())
        .then(movies => {
          if (movies && movies.length > 0) {
            featuredMovie = movies[0];
          } else {
            featuredMovie = sampleMovies[0];
          }
          updateBanner(featuredMovie);
        })
        .catch(error => {
          console.error('Error al cargar el banner:', error);
          featuredMovie = sampleMovies[0];
          updateBanner(featuredMovie);
        });
    } catch (error) {
      console.error('Error:', error);
      featuredMovie = sampleMovies[0];
      updateBanner(featuredMovie);
    }
  }
  
  // Actualizar el banner con la información de la película
  function updateBanner(movie) {
    const heroBanner = document.getElementById('heroBanner');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerDescription = document.getElementById('bannerDescription');
    
    heroBanner.style.backgroundImage = `url(${movie.url_imagen})`;
    bannerTitle.textContent = movie.titulo;
    bannerDescription.textContent = movie.descripcion;
  }
  
  // Abrir modal con detalles de la película
  function openMovieModal(movieId) {
    const modal = document.getElementById('movieModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalImage = document.getElementById('modalImage');
    
    // Buscar la película por ID
    let selectedMovie;
    
    try {
      // Intentar obtener la película desde la API
      fetch('../api/peliculas/consultar.php')
        .then(response => response.json())
        .then(movies => {
          selectedMovie = movies.find(movie => movie.id == movieId);
          
          if (!selectedMovie) {
            selectedMovie = sampleMovies.find(movie => movie.id == movieId);
          }
          
          if (selectedMovie) {
            modalTitle.textContent = selectedMovie.titulo;
            modalDescription.textContent = selectedMovie.descripcion;
            modalImage.src = selectedMovie.url_imagen;
            modalImage.onerror = function() {
              this.src = 'https://via.placeholder.com/300x450?text=Imagen+no+disponible';
            };
            
            // Actualizar metadatos de la película
            document.querySelector('.movie-year').textContent = selectedMovie.anio || '2023';
            document.querySelector('.movie-rating').innerHTML = `<i class="fas fa-star"></i> ${selectedMovie.calificacion || '8.5'}`;
            document.querySelector('.movie-duration').textContent = `${selectedMovie.duracion || '120'} min`;
            document.querySelector('.movie-price span').textContent = `Precio: $${selectedMovie.precio || '9.99'}`;
            
            modal.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error al cargar detalles de la película:', error);
          selectedMovie = sampleMovies.find(movie => movie.id == movieId);
          
          if (selectedMovie) {
            modalTitle.textContent = selectedMovie.titulo;
            modalDescription.textContent = selectedMovie.descripcion;
            modalImage.src = selectedMovie.url_imagen;
            modalImage.onerror = function() {
              this.src = 'https://via.placeholder.com/300x450?text=Imagen+no+disponible';
            };
            
            // Actualizar metadatos de la película
            document.querySelector('.movie-year').textContent = selectedMovie.anio || '2023';
            document.querySelector('.movie-rating').innerHTML = `<i class="fas fa-star"></i> ${selectedMovie.calificacion || '8.5'}`;
            document.querySelector('.movie-duration').textContent = `${selectedMovie.duracion || '120'} min`;
            document.querySelector('.movie-price span').textContent = `Precio: $${selectedMovie.precio || '9.99'}`;
            
            modal.style.display = 'block';
          }
        });
    } catch (error) {
      console.error('Error:', error);
      selectedMovie = sampleMovies.find(movie => movie.id == movieId);
      
      if (selectedMovie) {
        modalTitle.textContent = selectedMovie.titulo;
        modalDescription.textContent = selectedMovie.descripcion;
        modalImage.src = selectedMovie.url_imagen;
        
        modal.style.display = 'block';
      }
    }
  }
  
  // Cerrar el modal
  document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('movieModal').style.display = 'none';
  });
  
  // Cerrar el modal al hacer clic fuera del contenido
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });