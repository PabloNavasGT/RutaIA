const API_BASE_URL = 'http://localhost:8080/api';

// Usamos sessionStorage para que la sesión expire al cerrar la pestaña o el navegador
let activeStudentName = sessionStorage.getItem('rutaia_student_name') || null;
let cursosData = [];
let historialConsultas = [
  {
    id: 1718000001000,
    fecha: '2026/10/30 10:15:00',
    pregunta: 'Quiero aprender desarrollo web moderno usando JavaScript y frameworks.',
    estado: 'Respondida',
    respuesta: 'Te recomendamos iniciar con nuestro curso de Frontend Web Moderno y complementar con arquitecturas de backend.',
    fuentes: [
      { nombre: 'Frontend Web Moderno', categoria: 'Desarrollo Web', score: '95%' },
      { nombre: 'Arquitectura Java Spring Boot', categoria: 'Backend', score: '88%' }
    ]
  }
];

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

/* CONTROL DE ACCESO (GUARD) & PANTALLA COMPLETA */
function checkAuthGuard() {
  const overlay = document.getElementById('authOverlay');
  if (activeStudentName) {
    if (overlay) overlay.classList.add('hidden');
    updateBadgeUI();
  } else {
    if (overlay) overlay.classList.remove('hidden');
  }
}

function updateBadgeUI() {
  const el = document.getElementById('activeStudentName');
  if (el) el.textContent = activeStudentName || 'Invitado';
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
    
      // Guardamos credenciales en localStorage para que el Login pueda validarlas
      localStorage.setItem(`rutaia_user_${email}`, JSON.stringify(payload));

      // Guardamos la sesión actual en sessionStorage (expira al cerrar pestaña)
      activeStudentName = nombre;
      sessionStorage.setItem('rutaia_student_name', activeStudentName);
      
      checkAuthGuard();
      formReg.reset();
      alert('¡Cuenta registrada y sesión iniciada!');

    } catch (err) {
      console.warn('⚠️ Servidor backend offline. Guardando sesión localmente.');
      localStorage.setItem(`rutaia_user_${email}`, JSON.stringify(payload));
      activeStudentName = nombre;
      sessionStorage.setItem('rutaia_student_name', activeStudentName);
      checkAuthGuard();
      formReg.reset();
      alert('¡Cuenta registrada localmente y sesión iniciada!');
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
        sessionStorage.setItem('rutaia_student_name', activeStudentName);
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

  // 3. BOTÓN CERRAR SESIÓN
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('¿Deseas cerrar tu sesión actual?')) {
        sessionStorage.removeItem('rutaia_student_name'); 
        activeStudentName = null;
        checkAuthGuard();
      }
    });
  }
}

/* NAVEGACIÓN SPA */
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

/* CATÁLOGO Y VISTA DETALLADA DE CURSOS CON 10 CLASES */
async function fetchCursos() {
  try {
    const res = await fetch(`${API_BASE_URL}/cursos`);
    if (!res.ok) throw new Error('Falló al obtener cursos');
    cursosData = await res.json();
    console.log(' Cursos cargados desde MongoDB:', cursosData.length);
  } catch (err) {
    console.warn(' Error al conectar con el backend de cursos:', err);
    cursosData = [];
  }
  renderCursos(cursosData);
}

function renderCursos(cursos) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  if (!cursos || cursos.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:2rem;">No hay cursos disponibles. Ejecuta node src/seed.js en tu terminal.</p>';
    return;
  }

  cursos.forEach(c => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.cursor = 'pointer';
    card.onclick = () => abrirDetalleCurso(c._id || c.id);
    card.innerHTML = `
      <div>
        <h3 class="course-title">${c.nombre}</h3>
        <p class="course-desc">${c.descripcion}</p>
      </div>
      <div class="course-tags">
        <span>${c.categoria}</span>
        <span>${c.nivel} (${c.clases ? c.clases.length : 10} Clases)</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function initCoursesModule() {
  const fCat = document.getElementById('filterCat');
  const fNivel = document.getElementById('filterNivel');

  const aplicarFiltros = () => {
    const catVal = fCat ? fCat.value : 'TODAS';
    const nivelVal = fNivel ? fNivel.value : 'TODOS';
    
    const filtrados = cursosData.filter(c => {
      const matchCat = catVal === 'TODAS' || c.categoria === catVal;
      const matchNivel = nivelVal === 'TODOS' || c.nivel === nivelVal;
      return matchCat && matchNivel;
    });
    renderCursos(filtrados);
  };

  if (fCat) fCat.addEventListener('change', aplicarFiltros);
  if (fNivel) fNivel.addEventListener('change', aplicarFiltros);
}

function abrirDetalleCurso(cursoId) {
  const curso = cursosData.find(c => (c._id || c.id) === cursoId);
  if (!curso) return;

  const modal = document.getElementById('modalCursoDetalle');
  if (!modal) return;

  document.getElementById('modalCursoNombre').textContent = curso.nombre;
  document.getElementById('modalCursoCategoria').textContent = `${curso.categoria} • ${curso.nivel} (${curso.duracion})`;
  document.getElementById('modalCursoDesc').textContent = curso.descripcion;

  const list = document.getElementById('modalClasesList');
  list.innerHTML = '';

  const clases = curso.clases && curso.clases.length > 0 ? curso.clases : Array.from({ length: 10 }, (_, i) => ({
    _id: `clase_${i + 1}`,
    numero: i + 1,
    titulo: `Clase ${i + 1}: Tema especializado`,
    descripcion: `Contenido práctico de la lección número ${i + 1}.`,
    puntuacion: 0
  }));

  clases.forEach(clase => {
    const claseEl = document.createElement('div');
    claseEl.className = 'course-card';
    claseEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <strong style="color:var(--gold-light)">Clase ${clase.numero}: ${clase.titulo}</strong>
        <div class="rating-gems" data-clase-id="${clase._id}" style="font-size: 1.3rem;">
          ${[1, 2, 3, 4, 5].map(v => `<span class="gem-star ${v <= (clase.puntuacion || 0) ? 'active' : ''}" data-value="${v}">◆</span>`).join('')}
        </div>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem">${clase.descripcion}</p>
    `;
    list.appendChild(claseEl);

    // Calificación de cada clase con gemas (1 a 5)
    const gems = claseEl.querySelectorAll('.gem-star');
    gems.forEach(gem => {
      gem.addEventListener('click', async () => {
        const p = parseInt(gem.getAttribute('data-value'));
        clase.puntuacion = p;
        gems.forEach(g => {
          if (parseInt(g.getAttribute('data-value')) <= p) g.classList.add('active');
          else g.classList.remove('active');
        });

        try {
          await fetch(`${API_BASE_URL}/cursos/${curso._id || curso.id}/clases/${clase._id}/calificar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puntuacion: p })
          });
        } catch (e) {
          console.warn('Calificación de clase guardada localmente.');
        }
      });
    });
  });

  modal.classList.remove('hidden');

  // Botón de cierre
  const btnCerrar = document.getElementById('btnCerrarModalCurso');
  if (btnCerrar) {
    btnCerrar.onclick = () => modal.classList.add('hidden');
  }

  // Cerrar al hacer clic fuera de la tarjeta modal
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  };
}

// Cerrar con la tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modalCursoDetalle');
    if (modal) modal.classList.add('hidden');
  }
});

/* ASISTENTE RAG */
function initRAGModule() {
  const form = document.getElementById('formConsulta');
  const loading = document.getElementById('loadingRAG');
  const results = document.getElementById('ragResults');

  if (!form) return;

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
        respuestaIA: `¡Hola ${activeStudentName}! Es un gusto saludarte. Analizando tu consulta: "${promptText}", te recomiendo iniciar con nuestros cursos especializados.`,
        fuentes: [
          { nombre: 'Frontend Web Moderno', categoria: 'Desarrollo Web', score: '95%' },
          { nombre: 'Arquitectura Java Spring Boot', categoria: 'Backend', score: '88%' }
        ]
      };
    }

    loading.classList.add('hidden');
    results.classList.remove('hidden');
    document.getElementById('aiResponseText').textContent = resultData.respuestaIA;

    const sourcesGrid = document.getElementById('sourcesGrid');
    sourcesGrid.innerHTML = '';
    if (resultData.fuentes && Array.isArray(resultData.fuentes)) {
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
    }

    historialConsultas.unshift({
      id: resultData.id || Date.now(),
      fecha: new Date().toLocaleString(),
      pregunta: promptText,
      estado: 'Respondida',
      respuesta: resultData.respuestaIA,
      fuentes: resultData.fuentes || []
    });
    renderHistorial();
  });
}

/* HISTORIAL & MODAL */
function initHistorialModule() {
  renderHistorial();
  const modal = document.getElementById('modalHistorial');
  const btnCerrar = document.getElementById('btnCerrarModal');
  if (btnCerrar && modal) {
    btnCerrar.addEventListener('click', () => modal.classList.add('hidden'));
  }
}

function renderHistorial() {
  const tbody = document.getElementById('historialBody');
  const selectCalf = document.getElementById('selectConsultaCalificar');
  if (!tbody || !selectCalf) return;

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

/* CALIFICACIÓN */
function initRatingModule() {
  const gems = document.querySelectorAll('#ratingGems .gem-star');
  const inputVal = document.getElementById('inputRatingValue');
  const form = document.getElementById('formCalificar');

  if (!form) return;

  gems.forEach(gem => {
    gem.addEventListener('click', () => {
      const rating = parseInt(gem.getAttribute('data-value'));
      if (inputVal) inputVal.value = rating;
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
    const puntuacion = inputVal ? inputVal.value : '0';

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
    if (inputVal) inputVal.value = '0';
  });
}

/*DASHBOARD */
function updateDashboardMetrics() {
  const mTotal = document.getElementById('mTotalConsultas');
  const mResp = document.getElementById('mRespondidas');
  const mProm = document.getElementById('mPromedioCalf');
  const mTop = document.getElementById('mTopCurso');

  if (mTotal) mTotal.textContent = historialConsultas.length;
  if (mResp) mResp.textContent = historialConsultas.filter(h => h.estado === 'Respondida').length;
  if (mProm) mProm.textContent = '4.8 / 5';
  if (mTop) mTop.textContent = cursosData.length > 0 ? cursosData[0].nombre : 'Frontend Web Moderno';
}