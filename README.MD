RutaIA!!

RutaIA es un sistema Full-Stack con estética Hextech diseñado para brindar recomendaciones académicas personalizadas mediante Inteligencia Artificial basada en RAG (Retrieval-Augmented Generation). Integra una arquitectura modular con Node.js/Express, MongoDB como base de datos relacional/documental, un motor vectorial Qdrant, orquestación de flujos de trabajo en n8n,conectada a Google Gemini (LLM & Embeddings), y una SPA responsiva con calificadores interactivos de gemas.

---

## Estructura del Proyecto (Cómo Funciona)

El proyecto sigue una arquitectura por capas separando infraestructura, lógica de negocio, controladores y la interfaz de usuario:

```text
Ruta IA/
 ┣ 📂 .vscode/
 ┣ 📂 node_modules/
 ┣ 📂 src/
 ┃  ┣ 📂 config/
 ┃  ┃  ┗ 📜 database.js          # Configuración de conexión a MongoDB (Mongoose)
 ┃  ┣ 📂 controllers/
 ┃  ┃  ┣ 📜 estudianteController.js # Registro y consulta de estudiantes
 ┃  ┃  ┣ 📜 consultaController.js   # Gestión de peticiones RAG y comunicación con n8n Webhook
 ┃  ┃  ┣ 📜 cursoController.js      # Catálogo de cursos, lecciones y calificaciones por clase
 ┃  ┃  ┗ 📜 calificacionController.js # Evaluaciones generales de respuestas IA
 ┃  ┣ 📂 repositories/
 ┃  ┃  ┣ 📜 estudianteRepository.js # Esquema Mongoose para estudiantes
 ┃  ┃  ┣ 📜 consultaRepository.js   # Esquema Mongoose para consultas RAG
 ┃  ┃  ┣ 📜 cursoRepository.js      # Esquema de Cursos con subdocumentos para 10 Clases
 ┃  ┃  ┗ 📜 calificacionRepository.js # Esquema de Calificaciones generales
 ┃  ┣ 📜 app.js                      # Inicialización de Express, Middlewares globales y Rutas API
 ┃  ┗ 📜 seed.js                     # Script independiente para poblar la BD con 7 cursos y 10 clases
 ┣ 📜 index.html                     # Interfaz de usuario SPA con temática Hextech (Modal, RAG, Dashboard)
 ┣ 📜 service.js                     # Lógica JavaScript cliente (SPA, consumo API REST, sessionStorage)
 ┣ 📜 styles.css                    # Hoja de estilos Hextech (Neon glow, animaciones y diseño adaptable)
 ┣ 📜 .env                           # Variables de entorno (PORT=8080, MONGO_URI, N8N_WEBHOOK_URL)
 ┣ 📜 .gitignore                     # Archivos excluidos de Git
 ┣ 📜 package.json                   # Dependencias y scripts de Node.js
 ┗ 📜 README.md                      # Documentación oficial del proyecto
```

---

##  Base de Datos MongoDB y Colecciones

La base de datos corre localmente en el puerto predeterminado **`27017`**:
- URI de Conexión:`mongodb://localhost:27017/rutaia` o `mongodb://127.0.0.1:27017/rutaia`
- Nombre de la Base de Datos: `rutaia`

### Colecciones Principales:

1. `estudiantes`: Guarda perfiles de usuarios con sus áreas de interés, contraseña y preguntas de verificación.
2. `consultas`: Almacena el historial de preguntas formuladas por los estudiantes, estado de respuesta (`Pendiente`, `Respondida`) y las recomendaciones generadas por la IA.
3. `calificaciones`: Registro de evaluaciones globales (1 a 5 gemas y comentarios) que los estudiantes otorgan a las respuestas emitidas por la IA.
4. `cursos`: Catálogo de cursos activos. Cada documento incluye un arreglo embebido con mínimo 10 clases, estructuradas con la siguiente forma:
   ```json
   {
     "_id": "ObjectId",
     "nombre": "Frontend Web Moderno",
     "categoria": "Desarrollo Web",
     "nivel": "Principiante",
     "duracion": "40 hrs",
     "estado": "ACTIVO",
     "clases": [
       {
         "_id": "ObjectId",
         "numero": 1,
         "titulo": "Introducción a Frontend Web Moderno",
         "descripcion": "Fundamentos iniciales, configuración del entorno...",
         "puntuacion": 0
       }
       /* ... 10 clases en total */
     ]
   }
   ```

---

## Arquitectura y Funcionamiento de n8n con IA RAG

El orquestador **n8n** se ejecuta de manera independiente en el puerto **`5678`** y actúa como el motor inteligente de recomendación.

### Flujo Interno del Agente AI en n8n:

1. **`Webhook` (Trigger):** Escucha las peticiones `POST` enviadas desde el backend de Node.js con el identificador de consulta y la pregunta del estudiante.
2. **`AI Agent` (Nodo Central):**
   - Configurado con un mensaje de sistema para asumir la personalidad de un **orientador vocacional sumamente amable, empático, educado y altamente analítico/vectorial**.
3. **`Google Gemini Chat Model`:** Proporciona la capacidad de lenguaje natural (LLM) al agente.
4. **`Qdrant Vector Store` (Herramienta RAG):** Conectado a la colección vectorial **`cursos_rutaia`**, realiza la búsqueda semántica de los fragmentos de cursos que coincidan vectorialmente con la inquietud académica.
5. **`Embeddings Google Gemini`:** Convierte la consulta del usuario en vectores para compararla contra Qdrant.
6. **`MongoDB Chat Memory`:** Mantiene el contexto conversacional del estudiante para dar seguimiento a preguntas subsecuentes.
7. **`Respond to Webhook`:** Retorna la respuesta generada a Node.js en formato JSON estricto:
   ```json
   {
     "respuestaIA": "¡Hola Jayce! Es un placer saludarte...",
     "estado": "Respondida",
     "fuentes": [
       {
         "nombre": "Frontend Web Moderno",
         "categoria": "Desarrollo Web",
         "score": "95%"
       }
     ]
   }
   ```

---

##  Pasos para Ejecutar el Repositorio

Sigue estos pasos secuenciales para poner en marcha todo el ecosistema localmente:

### 1. Requisitos Previos
- Tienes instalado **Node.js** (v18+) y **npm**.
- Tienes **MongoDB Community Server** ejecutándose en `localhost:27017`.
- Tienes **n8n** y **Qdrant** configurados en tu entorno local o Docker.

### 2. Instalación de Dependencias
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Poblar la Base de Datos MongoDB (Seed)
Pobla MongoDB con los 7 cursos iniciales, asegurando sus **10 clases individuales** con calificadores de gemas:
```bash
npm run seed
```
Salida esperada:
```text
 Conectando a MongoDB...
 Conectado a MongoDB.
 Limpiando colección anterior de cursos...
 Poblando 7 cursos completos con 10 clases cada uno...
 ¡Éxito! Se insertaron 7 cursos correctamente en MongoDB.
```

### 4. Configurar Variables de Entorno (`.env`)
Verifica o crea el archivo `.env` en la raíz con el puerto **8080**:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/rutaia
N8N_WEBHOOK_URL=http://localhost:5678/webhook/16663d6e-5c63-4bd0-855f-de0817e99984
```

### 5. Iniciar el Servidor Backend
Inicia el servidor Node.js en modo desarrollo con recarga automática (`--watch`):
```bash
npm run dev
```
*El servidor levantará en `http://localhost:8080`.*

### 6. Iniciar el Orquestador n8n
En una terminal secundaria, levanta tu instancia de n8n en el puerto `5678` y asegúrate de activar el flujo RAG:
```bash
n8n start
```

---

## Línea de Trabajo y Flujo de Funcionamiento Paso a Paso

1. **Autenticación en la SPA Hextech:**
   - El estudiante accede a `index.html`. Si no existe una sesión activa, la pantalla completa de autenticación bloquea la vista.
   - Puede **Registrarse** o **Iniciar Sesión**. Al autenticarse con éxito, las credenciales del perfil se guardan para validación futura en `localStorage`, pero la **sesión activa se almacena en `sessionStorage`**.
   - *Comportamiento de seguridad:* Al cerrar la pestaña o el navegador, la sesión en `sessionStorage` se destruye automáticamente, exigiendo login en la siguiente visita.

2. **Visualización del Catálogo de Cursos:**
   - En la pestaña **Cursos**, el cliente realiza un `fetch` a `GET http://localhost:8080/api/cursos`.
   - Renderiza las tarjetas de los cursos filtrables por categoría o nivel.

3. **Índice de 10 Clases y Calificador de Gemas (1 a 5):**
   - Al hacer clic en cualquier tarjeta de curso, se despliega el modal interactivo con el temario completo de **10 clases**.
   - Cada clase dispone de un calificador con **5 gemas interactiva Hextech (◆)**. Al hacer clic sobre cualquier gema, se efectúa una petición `PUT` a `/api/cursos/:cursoId/clases/:claseId/calificar`, guardando la valoración de la clase individual en MongoDB.
   - El modal incluye un **botón de cierre fijo ("×")**, soporte para salir al presionar la tecla **`Escape`** y cierre al hacer clic fuera del modal.

4. **Consulta al Asistente RAG:**
   - El estudiante ingresa una inquietud en lenguaje natural en la pestaña **Asistente RAG**.
   - El backend registra la consulta en MongoDB en la colección `consultas` con estado `"Pendiente"`.
   - Inmediatamente, Node.js realiza un `axios.post` hacia la URL de n8n (`N8N_WEBHOOK_URL`).

5. **Procesamiento e Inferencia IA:**
   - **n8n** recibe la consulta, extrae el perfil del alumno, consulta la base de datos vectorial **Qdrant** (`cursos_rutaia`) y utiliza **Gemini LLM** para formular una respuesta amable, motivadora y precisa.
   - n8n responde al backend de Node.js con un objeto conteniendo `respuestaIA` y las `fuentes`.
   - Node.js actualiza el estado de la consulta en MongoDB a `"Respondida"` y devuelve los datos al frontend.

6. **Renderizado de Respuesta e Historial:**
   - La SPA quita el spinner de carga y proyecta la respuesta enriquecida del asistente junto a las fuentes vectoriales.
   - La interacción se registra automáticamente en las pestañas de **Historial**, **Calificar** (para calificar la recomendación general de la IA) y **Estadísticas**.