/* =========================================================
    BOOTSTRAP DROPDOWNS + AOS
   ========================================================= */
// Carrega a navbar dinâmica e inicializa componentes
document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html")  // Funciona porque o script é chamado de páginas em /pages
    .then(r => r.text())
    .then(html => {
      document.getElementById("navbar-container").innerHTML = html;

      // Inicializa dropdowns (bootstrap 5)
      const dropdowns = document.querySelectorAll('.dropdown-toggle');
      dropdowns.forEach(el => new bootstrap.Dropdown(el));

      // Marca link activo com base no pathname
      const links = document.querySelectorAll('.nav-link, .dropdown-item');
      const path = window.location.pathname.split("/").pop() || 'index.html';
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === path) {
          link.classList.add('active');
          // Se for um item de dropdown, ativa também o pai (o toggle)
          if (link.classList.contains('dropdown-item')) {
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
              const toggle = parentDropdown.querySelector('.dropdown-toggle');
              if (toggle) toggle.classList.add('active');
            }
          }
        }
      });

      // Atualiza links de autenticação
      if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
        document.querySelectorAll('.auth-guest').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll('.auth-user').forEach(el => el.classList.remove('d-none'));
      }

    })
    .catch(err => console.error("Erro ao carregar navbar:", err));
});

/* =========================================================
   LIGHTBOX
   ========================================================= */

function openModal() {
  document.getElementById("myModal").style.display = "block";
  // Adiciona a classe 'open' para ativar as transições/animações CSS
  document.getElementById("myModal").classList.add("open");
}

function closeModal() {
  // Remove a classe 'open' para ativar a transição de fecho
  document.getElementById("myModal").classList.remove("open");
  // Pequeno atraso para o CSS de fecho terminar antes de esconder o modal
  setTimeout(function () {
    document.getElementById("myModal").style.display = "none";
  }, 300); // 300ms = Duração da sua transição CSS
}

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");

  // Se não houver slides nesta página, não faz nada (evita erro)
  if (slides.length === 0) return;

  var dots = document.getElementsByClassName("demo");
  var captionText = document.getElementById("caption");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
  captionText.innerHTML = dots[slideIndex - 1].alt;
}

/* =========================================================
   FORMULÁRIO
   ========================================================= */

function validateForm(event) {
  event.preventDefault();

  // Agora o JavaScript encontra os inputs!
  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();

  const form = document.getElementById('inscricao-form');
  const messageContainer = document.getElementById('messageContainer');

  // Validação Mínima
  if (name === "" || email === "") {
    alert("Por favor, preencha o Nome Completo e o E-mail.");
    return false;
  }

  // Se a validação passar:
  form.style.display = 'none';
  messageContainer.style.display = 'block';

  return false;
}

