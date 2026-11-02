/**
 * RUTAIA - LÓGICA PRINCIPAL VANILLA JS
 * Control de Autenticación con separación estricta de vistas
 */

const API_BASE_URL = 'http://localhost:8080/api';

let activeStudentName = localStorage.getItem('rutaia_student_name') || null;
let cursosData = [];
let historialConsultas = [
  {
    id: 101,
    fecha: '2026-10-28 14:30',
    pregunta: 'Quiero aprender desarrollo backend con Java y APIs REST.',
    estado: 'Respondida',
    respuesta: 'Se recomienda iniciar con el curso de Backend Spring Boot, complementado con bases de datos relacionales.',
    fuentes: [{ nombre: 'Backend Spring Boot', categoria: 'Backend', score: '95%' }]
  }
];

function updateBadgeUI() {
  const badgeName = document.getElementById('activeStudentName');
  if (badgeName && activeStudentName) {
    badgeName.textContent = activeStudentName;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthGuard();
  initAuthScreen();
  initNavigation();
  initCoursesModule();
  initRAGModule();
  initHistorialModule();
  initRatingModule();
  
  fetchCursos();
});

/* ==========================================================================
   CONTROL DE ACCESO (GUARD) & PANTALLA COMPLETA
   ========================================================================== */
function checkAuthGuard() {
  const overlay = document.getElementById('authOverlay');
  if (activeStudentName) {
    overlay.classList.add('hidden');
    updateBadgeUI();
  } else {
    overlay.classList.remove('hidden');
  }
}

function initAuthScreen() {
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const authForms = document.querySelectorAll('.auth-form');
  const subtitle = document.getElementById('authSubtitle');

  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-auth');
      
      authTabBtns.forEach(b => b.classList.remove('active'));
      authForms.forEach(f => f.classList.remove('active'));

      btn.classList.add('active');
      if (target === 'registro') {
        document.getElementById('formRegistro').classList.add('active');
        subtitle.textContent = 'Registro de Nueva Cuenta Estudiantil';
      } else {
        document.getElementById('formLogin').classList.add('active');
        subtitle.textContent = 'Acceso al Núcleo de Recomendación Académica';
      }
    });
  });

  // 1. REGISTRO DE CUENTA
  const formReg = document.getElementById('formRegistro');
  formReg.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const nivel = document.getElementById('regNivel').value;
    const interes = document.getElementById('regInteres').value.trim();
    const comida = document.getElementById('regComida').value.trim().toLowerCase();

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (password.length < 6 || !hasLetters || !hasNumbers) {
      alert('La contraseña debe tener al menos 6 caracteres y contener tanto letras como números.');
      return;
    }

    const payload = {
      nombreCompleto: nombre,
      email: email,
      password: password,
      nivelExperiencia: nivel,
      areaInteres: interes,
      comidaFavorita: comida
    };

    try {
      const response = await fetch(`${API_BASE_URL}/estudiantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al registrar');
    
      console.log('✅ Guardado en MongoDB exitosamente:', data);

      // CORRECCIÓN FALLO #2: Guardar el usuario completo localmente para que el Login funcione
      localStorage.setItem(`rutaia_user_${email}`, JSON.stringify(payload));

      activeStudentName = nombre;
      localStorage.setItem('rutaia_student_name', activeStudentName);
      
      checkAuthGuard();
      formReg.reset();
      alert('¡Cuenta registrada y guardada en MongoDB exitosamente!');

    } catch (err) {
      console.error('❌ Error al conectar con el backend:', err);
      alert('Error al conectar con el servidor backend. Revisa la consola.');
    }
  });

  // 2. INICIO DE SESIÓN
  const formLogin = document.getElementById('formLogin');
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const comida = document.getElementById('loginComida').value.trim().toLowerCase();

    const savedUserJson = localStorage.getItem(`rutaia_user_${email}`);
    
    if (savedUserJson) {
      const user = JSON.parse(savedUserJson);
      if (user.password === password && user.comidaFavorita === comida) {
        activeStudentName = user.nombreCompleto;
        localStorage.setItem('rutaia_student_name', activeStudentName);
        checkAuthGuard();
        formLogin.reset();
        return;
      } else {
        alert('Credenciales incorrectas. Verifica tu contraseña y tu comida favorita.');
        return;
      }
    } else {
      alert('Correo no encontrado en el registro local. Por favor regístrate primero.');
    }
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('¿Deseas cerrar tu sesión actual?')) {
      localStorage.removeItem('rutaia_student_name');
      activeStudentName = null;
      checkAuthGuard();
    }
  });
}

/* ==========================================================================
   NAVEGACIÓN SPA
   ========================================================================== */
function initNavigation() {
  const navBtns = document.querySelectorAll('.hextech-nav .nav-btn');
  const sections = document.querySelectorAll('.view-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'sec-dashboard') updateDashboardMetrics();
    });
  });
}

/* ==========================================================================
   CATÁLOGO DE CURSOS
   ========================================================================== */
async function fetchCursos() {
  try {
    const res = await fetch(`${API_BASE_URL}/cursos`);
    if (!res.ok) throw new Error('Falló al obtener cursos');
    cursosData = await res.json();
  } catch (err) {
    cursosData = [
      { id: 1, nombre: 'Frontend Web Moderno', descripcion: 'HTML5, CSS3 Grid/Flexbox y JavaScript Vanilla avanzado.', categoria: 'Desarrollo Web', nivel: 'Principiante', duracion: '40 hrs' },
      { id: 2, nombre: 'Arquitectura Java Spring Boot', descripcion: 'Desarrollo de Microservicios y APIs RESTful robustas.', categoria: 'Backend', nivel: 'Intermedio', duracion: '60 hrs' },
      { id: 3, nombre: 'Introducción a RAG e IA', descripcion: 'Integración de LLMs, Embeddings y Bases de Datos Vectoriales.', categoria: 'Inteligencia Artificial', nivel: 'Avanzado', duracion: '45 hrs' },
      { id: 4, nombre: 'PostgreSQL & Optimización', descripcion: 'Diseño relacional, índices y consultas complejas.', categoria: 'Base de Datos', nivel: 'Intermedio', duracion: '35 hrs' }
    ];
  }
  renderCursos(cursosData);
}

function renderCursos(cursos) {
  const grid = document.getElementById('coursesGrid');
  grid.innerHTML = '';
  if (cursos.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No hay cursos que coincidan con el filtro.</p>';
    return;
  }
  cursos.forEach(c => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div>
        <h3 class="course-title">${c.nombre}</h3>
        <p class="course-desc">${c.descripcion}</p>
      </div>
      <div class="course-tags">
        <span>${c.categoria}</span>
        <span>${c.nivel}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function initCoursesModule() {
  const fCat = document.getElementById('filterCat');
  const fNivel = document.getElementById('filterNivel');

  const aplicarFiltros = () => {
    const catVal = fCat.value;
    const nivelVal = fNivel.value;
    const filtrados = cursosData.filter(c => {
      const matchCat = catVal === 'TODAS' || c.categoria === catVal;
      const matchNivel = nivelVal === 'TODOS' || c.nivel === nivelVal;
      return matchCat && matchNivel;
    });
    renderCursos(filtrados);
  };

  fCat.addEventListener('change', aplicarFiltros);
  fNivel.addEventListener('change', aplicarFiltros);
}

/* ==========================================================================
   ASISTENTE RAG
   ========================================================================== */
function initRAGModule() {
  const form = document.getElementById('formConsulta');
  const loading = document.getElementById('loadingRAG');
  const results = document.getElementById('ragResults');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const promptText = document.getElementById('inputPrompt').value;
    loading.classList.remove('hidden');
    results.classList.add('hidden');

    const payload = { estudiante: activeStudentName, prompt: promptText };
    let resultData;

    try {
      const res = await fetch(`${API_BASE_URL}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al procesar RAG');
      resultData = await res.json();
    } catch (err) {
      await new Promise(r => setTimeout(r, 1200));
      resultData = {
        id: Date.now(),
        respuestaIA: `Recomendación procesada para ${activeStudentName} basada en: "${promptText}". Te sugerimos iniciar con Frontend y Spring Boot.`,
        fuentes: [
          { nombre: 'Frontend Web Moderno', categoria: 'Desarrollo Web', score: '92%' },
          { nombre: 'Arquitectura Java Spring Boot', categoria: 'Backend', score: '87%' }
        ]
      };
    }

    loading.classList.add('hidden');
    results.classList.remove('hidden');
    document.getElementById('aiResponseText').textContent = resultData.respuestaIA;

    const sourcesGrid = document.getElementById('sourcesGrid');
    sourcesGrid.innerHTML = '';
    resultData.fuentes.forEach(f => {
      const sc = document.createElement('div');
      sc.className = 'source-card';
      sc.innerHTML = `
        <span class="source-score">${f.score}</span>
        <strong>${f.nombre}</strong>
        <p style="color:var(--text-muted); margin-top:0.3rem">${f.categoria}</p>
      `;
      sourcesGrid.appendChild(sc);
    });

    historialConsultas.unshift({
      id: resultData.id || Date.now(),
      fecha: new Date().toLocaleString(),
      pregunta: promptText,
      estado: 'Respondida',
      respuesta: resultData.respuestaIA,
      fuentes: resultData.fuentes
    });
    renderHistorial();
  });
}

/* ==========================================================================
   HISTORIAL & MODAL
   ========================================================================== */
function initHistorialModule() {
  renderHistorial();
  const modal = document.getElementById('modalHistorial');
  document.getElementById('btnCerrarModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

function renderHistorial() {
  const tbody = document.getElementById('historialBody');
  const selectCalf = document.getElementById('selectConsultaCalificar');
  tbody.innerHTML = '';
  selectCalf.innerHTML = '<option value="">Selecciona una consulta...</option>';

  historialConsultas.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.fecha}</td>
      <td>${item.pregunta}</td>
      <td><span style="color:var(--hextech-blue)">${item.estado}</span></td>
      <td><button class="nav-btn" onclick="verDetalleHistorial(${item.id})">Ver Detalle</button></td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `[${item.fecha}] ${item.pregunta.substring(0, 35)}...`;
    selectCalf.appendChild(opt);
  });
}

window.verDetalleHistorial = function(id) {
  const item = historialConsultas.find(h => h.id === id);
  if (!item) return;
  document.getElementById('modalFecha').textContent = `Consulta realizada el: ${item.fecha}`;
  document.getElementById('modalPregunta').textContent = item.pregunta;
  document.getElementById('modalRespuesta').textContent = item.respuesta;
  document.getElementById('modalFuentes').innerHTML = item.fuentes.map(f => `<div>• ${f.nombre} (${f.score})</div>`).join('');
  document.getElementById('modalHistorial').classList.remove('hidden');
};

/* ==========================================================================
   CALIFICACIÓN
   ========================================================================== */
function initRatingModule() {
  const gems = document.querySelectorAll('#ratingGems .gem-star');
  const inputVal = document.getElementById('inputRatingValue');
  const form = document.getElementById('formCalificar');

  gems.exports = gems.forEach(gem => {
    gem.addEventListener('click', () => {
      const rating = parseInt(gem.getAttribute('data-value'));
      inputVal.value = rating;
      gems.forEach(g => {
        if (parseInt(g.getAttribute('data-value')) <= rating) {
          g.classList.add('active');
        } else {
          g.classList.remove('active');
        }
      });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const consultaId = document.getElementById('selectConsultaCalificar').value;
    const puntuacion = inputVal.value;

    if (!consultaId || puntuacion === '0') {
      alert('Selecciona una consulta y asigna una puntuación con gemas.');
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/calificaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultaId, puntuacion, comentario: document.getElementById('inputComentario').value })
      });
    } catch (err) {
      console.warn('Backend offline. Calificación simulada.');
    }

    alert('¡Gracias por evaluar la recomendación!');
    form.reset();
    gems.forEach(g => g.classList.remove('active'));
    inputVal.value = '0';
  });
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
function updateDashboardMetrics() {
  document.getElementById('mTotalConsultas').textContent = historialConsultas.length;
  document.getElementById('mRespondidas').textContent = historialConsultas.filter(h => h.estado === 'Respondida').length;
  document.getElementById('mPromedioCalf').textContent = '4.8 / 5';
  document.getElementById('mTopCurso').textContent = 'Frontend Web Moderno';
}