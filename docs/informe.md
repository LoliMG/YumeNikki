# Auditoría Técnica y Crítica Constructiva: Proyecto YumeNikki
**Roles de Evaluación:** Lead Tech Recruiter & Principal Systems/Web Engineer  
**Fecha:** Octubre 2026  
**Objetivo:** Diagnóstico sin filtros del proyecto, identificando señales de código generado por IA, cuellos de botella de rendimiento, inconsistencias arquitectónicas y malas prácticas de ingeniería antes de presentar el código en un proceso de selección o llevarlo a producción.

---

## 1. Veredicto Ejecutivo & Impresión General

### La Perspectiva del Tech Recruiter
> *"El proyecto es muy vistoso a nivel funcional y visual: tiene autenticación con cookies httpOnly, integración astronómica, visualizaciones con gráficos y un diseño oscuro temático atractivo. Sin embargo, en cuanto abres el repositorio, saltan las alarmas de 'código 100% asistido por IA sin criterio crítico de un desarrollador senior'. Los comentarios didácticos en español, los componentes de 400 líneas, la ausencia de un gestor de servidor/caché (como TanStack Query) y los tests con un mock de base de datos casero delatan que el desarrollador pidió funcionalidades a un LLM y las fue encadenando sin refactorizar la arquitectura global. Si el candidato no sabe justificar por qué hizo ciertas decisiones en la entrevista técnica, quedará descartado."*

### La Perspectiva del Systems & Web Architect
> *"A nivel de sistemas, la aplicación tiene dos problemas críticos de escalabilidad y coherencia: primero, se comete el pecado capital de traerse colecciones enteras de la base de datos a la memoria de Node.js para ejecutar expresiones regulares y bucles en el hilo principal (`event loop`) en lugar de delegar el cómputo en PostgreSQL. Segundo, la arquitectura backend está a medio hacer: unos módulos tienen capa de servicio y validación con Zod, mientras que otros saltan directo del controlador al DAL sin validar nada. El frontend sufre de una ensalada de estilos (Bootstrap + CSS + estilos inline masivos) y falta de boundaries de error."*

---

## 2. Evaluación Backend (Node.js, Express, PostgreSQL)

### 2.1. Código Sucio y Puntos Críticos de Rendimiento (Peligro de Producción)

#### A. El Antipatrón de "Procesar en Memoria de Node" en lugar de PostgreSQL
En [`stats.dal.js`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/modules/stats/stats.dal.js):
```javascript
// stats.dal.js - getFrequentSymbols & getSymbolFrequency
const dreams = await executeQuery(
  `SELECT id, title, content, symbolisms FROM dreams WHERE ${conditions.join(' AND ')}`,
  params
);

const results = symbols.map(sym => {
  const regex = new RegExp(`(?<![a-záéíóúüñ])${escaped}(?![a-záéíóúüñ])`, 'gi');
  for (const d of dreams) {
    const text = `${d.title || ''} ${d.content || ''} ${d.symbolisms || ''}`;
    const matches = text.match(regex);
    // ...
  }
});
```
* **Por qué es inaceptable:**
  Si un usuario tiene 500 sueños registrados y 30 símbolos en su glosario, este código se descarga megabytes de texto plano de la base de datos a la RAM de Node.js y ejecuta **15.000 búsquedas por Regex en JavaScript**. Dado que Node.js es single-threaded, mientras este cálculo corre, **el servidor queda bloqueado y no puede atender peticiones de otros usuarios**.
* **Solución de Ingeniero:**
  PostgreSQL ya tiene índices trigram (`pg_trgm`) y soporte de búsqueda de texto completo (`tsvector` / `tsquery`). El conteo debe ejecutarse en el motor SQL mediante una subconsulta agregada o un `JOIN LATERAL`:
  ```sql
  SELECT sg.symbol_name, sg.archetype, COUNT(d.id)::int AS count
  FROM symbol_glossary sg
  LEFT JOIN dreams d ON d.user_id = sg.user_id 
    AND (d.title ~* sg.symbol_name OR d.content ~* sg.symbol_name OR d.symbolisms ~* sg.symbol_name)
  WHERE sg.user_id = $1
  GROUP BY sg.id, sg.symbol_name, sg.archetype
  ORDER BY count DESC
  LIMIT 10;
  ```

#### B. Cálculo de Rachas en Memoria (`getRecordingStreak`)
En [`stats.dal.js:114`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/modules/stats/stats.dal.js#L114):
Se descargan todas las fechas de la base de datos (`SELECT DISTINCT dream_date FROM dreams ...`) y se recorren mediante un bucle `for` comparando milisegundos con `Math.round(...)`.
* **Problema:** Un cálculo temporal puro debería resolverse en base de datos usando funciones de ventana (`LAG()` o CTEs de islas y huecos). Traspasar arrays de fechas para iterarlas en cliente/servidor es ineficiente y propenso a desajustes por zonas horarias.

#### C. Lista de Stopwords hardcodeada en el archivo de Base de Datos
En [`stats.dal.js:3-58`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/modules/stats/stats.dal.js#L3-L58):
Hay más de 100 líneas con un array gigante de palabras en español (`SPANISH_STOPWORDS`) metidas directamente en el archivo de acceso a datos (`stats.dal.js`).
* **Problema:** Viola el principio de separación de responsabilidades. Un DAL debe encargarse de queries SQL, no de diccionarios lingüísticos. Además, PostgreSQL incluye de serie el diccionario de stopwords en español para Full Text Search (`to_tsvector('spanish', text)`), haciendo innecesario este parche.

#### D. Almacenamiento local de archivos sin pipeline de optimización
En [`middlewares/upload.js`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/middlewares/upload.js) y [`utils/storage.js`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/utils/storage.js):
Las imágenes subidas se guardan tal cual en el sistema de archivos local (`public/uploads`) con `multer`.
* **Problemas:**
  1. Si un usuario sube una imagen de 8 MB desde su teléfono, se almacena sin comprimir, saturando el ancho de banda y el almacenamiento.
  2. En plataformas de despliegue modernas en la nube (Render, Railway, Heroku, contenedores ECS/Kubernetes), el almacenamiento de disco local es **efímero**: cada vez que el contenedor se reinicia o se despliega una nueva versión, las fotos de los usuarios se borran. Se requiere un adapter para S3/Cloudflare R2/Supabase Storage y compresión con `sharp`.

---

### 2.2. Antipatrones de Arquitectura Backend

#### A. Arquitectura "A Medias": Módulos con Servicio vs Módulos sin Servicio
Se observa una fractura grave en el diseño del backend:
* `modules/dream`: tiene `dream.controller.js` ➔ `dream.service.js` ➔ `dream.dal.js` (Arquitectura por capas estándar).
* `modules/tag`: tiene `tag.controller.js` ➔ `tag.service.js` ➔ `tag.dal.js`.
* `modules/stats`: **NO tiene servicio**. `stats.controller.js` llama directamente a `stats.dal.js`.
* `modules/glossary`: **NO tiene servicio**. `glossary.controller.js` llama directamente a `glossary.dal.js`.
* `modules/dayNote`: **NO tiene servicio**.
* `modules/menstrual`: **NO tiene servicio**.
* **Diagnóstico:** Inconsistencia de diseño. En una prueba técnica, esto demuestra que el patrón de diseño se copió en unos archivos y se ignoró en otros por descuido o por generar código con prompts independientes.

#### B. Validación Heterogénea
* `user.routes.js` y `tag.routes.js`: Utilizan middleware de validación declarativa con esquemas `Zod` (`validate(tagSchema)`).
* `dream.routes.js`: **No valida nada en la ruta**. La validación de que título y relato no estén vacíos está metida a mano dentro de `dream.service.js` con un `if (!title && !content) throw createError(400)`.
* `stats.routes.js`: Los parámetros de consulta (`startDate`, `endDate`, `month`) no se validan con ningún esquema; si alguien pasa una fecha corrupta, el error explota en el driver de base de datos.

#### C. Testing: El "Espejismo" de `MockDatabase`
En [`tests/mockDb.js`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/tests/mockDb.js):
Se construyó un mock artesanal de PostgreSQL con arrays de JavaScript (`this.users = []`, `this.dreams = []`) que simula queries haciendo `if (normalized.startsWith('INSERT INTO users'))`.
* **Por qué un arquitecto fruncirá el ceño:**
  1. **Falsos positivos continuos:** Este mock no valida tipos de datos reales de Postgres, no comprueba `FOREIGN KEY` reales, no valida `CHECK constraints`, ni ejecuta transacciones ACID reales (`BEGIN/COMMIT/ROLLBACK` son un simple `{ rows: [] }`).
  2. Si una query SQL tiene un error de sintaxis en producción (como una coma extra o un casting `::int` inválido), los tests pasarán verdes en local porque el mock sólo comprueba cadenas con `startsWith()`.
  3. **Solución estándar:** Para tests unitarios, mockear la capa de servicio con `sinon` o `node:test/mock`. Para tests de integración de base de datos, levantar un PostgreSQL real en contenedor con `testcontainers` o una base de datos local de test.

#### D. Manejo de Errores Superficial
En [`middlewares/errorHandler.js`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Server/middlewares/errorHandler.js):
Solo devuelve `{ message: err.message }`. No hay:
- Códigos de error tipados para el frontend (ej. `{ code: 'INVALID_CREDENTIALS', message: '...' }`).
- Estructura de errores de validación de Zod normalizada (mapear qué campo falló).
- Logger estructurado (Pino o Winston). `console.error` plano en producción no es trazable en sistemas como Datadog o CloudWatch.

---

### 2.3. Señales de "Demasiada IA" en el Backend
1. **Comentarios de narrador omnisciente:**  
   Comentarios como `// Comprobar si la racha actual está viva (hoy o ayer)`, `// yearMonth en formato 'YYYY-MM'`, `// Fallback seguro en memoria si la función unnest / regex no estuviera soportada en el mock de pruebas`. Un desarrollador senior no documenta qué hace cada `if`, documenta el *por qué* de las reglas complejas de negocio.
2. **Fallbacks silenciosos destructivos:**  
   En `stats.dal.js`:
   ```javascript
   } catch (_e) {
     return [];
   }
   ```
   Capturar cualquier error en un bloque DAL y devolver un array vacío sin loggear nada es el clásico vicio de los LLMs para que "nunca tire un error 500", pero oculta caídas de la base de datos o bugs de sintaxis.

---

## 3. Evaluación Frontend (React, Vite, CSS, UI/UX)

### 3.1. Estado y Gestión de Datos: La Ausencia de Server-State

#### A. Proliferación de `useEffect` y Estado Manual
En [`Stats.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/pages/Stats/Stats.jsx), [`Profile.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/pages/Profile/Profile.jsx), [`DreamList.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/pages/Dreams/DreamList/DreamList.jsx):
Cada página y componente reimplementa la misma rueda:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, [fetchData]);
```
* **Problema:** En React moderno (2024–2026), gestionar datos del servidor con `useState + useEffect` es considerado un code smell si no hay una justificación de bajo nivel.
* **Consecuencias:**
  1. **Sin caché:** Cada vez que el usuario navega entre "Sueños" y "Estadísticas", se vuelve a disparar toda la carga de red desde cero.
  2. **Desincronización de datos:** Si en el Perfil se edita o elimina una etiqueta, o en el Glosario se crea un símbolo, la página de Estadísticas o la lista de Sueños no se enteran a menos que el usuario refresque la página entera.
  3. **Solución estándar:** Integrar `@tanstack/react-query` (TanStack Query). Proporciona caché automática, revalidación en segundo plano, mutaciones optimistas y reduce el código de cada página a la mitad.

---

### 3.2. Código Sucio y Deuda Técnica en UI/CSS

#### A. Ensalada de Estilos (Spaghetti CSS + Inline Styles)
Existe un conflicto conceptual grave en cómo se estiliza la aplicación:
1. Se importa la librería pesada de **Bootstrap 5** y **React-Bootstrap** (`Card`, `Row`, `Col`, `d-flex`, `bg-surface-2`).
2. Se tienen archivos de **CSS tradicional** separados por página (`Stats.css`, `Profile.css`, `DreamList.css`).
3. Encima de ambos, se inundan los componentes con **estilos inline** masivos:
   ```jsx
   // En Stats.jsx y subcomponentes
   style={{ 
     backgroundColor: 'rgba(24, 20, 52, 0.92)', 
     borderColor: 'rgba(167, 139, 250, 0.3)', 
     backdropFilter: 'blur(10px)', 
     minWidth: 150 
   }}
   ```
* **Por qué no gusta en una entrevista:**
  - Los estilos inline en React no se pueden optimizar con PostCSS, dificultan el uso de pseudo-clases (`:hover`, `:focus`), no permiten `@media queries` nativas limpias y generan objetos en memoria que se recrean en cada renderizado.
  - El proyecto debió elegir un único sistema: o CSS Modules bien organizados, o Tailwind CSS, o un sistema de diseño con variables CSS nativas centralizadas en un token de tema.

#### B. Componentes Monolíticos ("God Components")
- [`Profile.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/pages/Profile/Profile.jsx): Más de 380 líneas donde conviven formularios de perfil, cambio de contraseña, modal de avatar, modal de confirmación de cuenta y subida de ficheros.
- [`Stats.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/pages/Stats/Stats.jsx): Más de 370 líneas donde conviven selectores de rango de fecha, KPIs, lógica de llamada a la API, renderizado de badges de símbolos, formularios de búsqueda y cajas de resultado.
* **Solución:** Extraer la sección de símbolos a `<FrequentSymbolsSection />`, el filtro a `<DateRangeFilter />`, y los KPIs a `<StatsKpiGrid />`.

#### C. Wrappers Innecesarios ("Shallow Wrappers")
Componentes como [`UIButton.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/components/UI/UIButton/UIButton.jsx) o [`UIForm.jsx`](file:///c:/Users/lolim/OneDrive/Desktop/PROYECTOS/YumeNikki/Client/src/components/UI/UIForm/UIForm.jsx):
Solo envuelven un `<button>` o un `<div className="form-group">` pasando `children` y `className` sin agregar lógica de accesibilidad, variantes robustas ni comportamiento real. Esto genera capas de indirección inútiles en el árbol del DOM.

---

### 3.3. Señales de "Demasiada IA" en el Frontend
1. **Comentarios de división de guion:**
   ```jsx
   {/* 1. Tarjetas resumen de métricas clave (KPIs) */}
   {/* 2. Fila: Evolución temporal (Área spline) + Distribución de tipos (Donut) */}
   {/* 3. Fila: Radar Lunar y Patrón de Fases */}
   {/* 4. Fila: Correlación con el Ciclo Menstrual */}
   {/* 5. Fila: Top 10 Símbolos Más Frecuentes */}
   ```
   Es la marca registrada de prompts del estilo *"agrúpalo por filas y pon comentarios en cada sección"*.
2. **Textos y mensajes mágicos hardcodeados:**  
   Todo está acoplado a cadenas fijas en español en medio del JSX. No hay ni un atisbo de abstracción para internacionalización (`i18next`) ni un archivo de constantes con textos/mensajes de error.
3. **Falta de React Error Boundaries:**  
   Librerías complejas como `recharts` son propensas a romper el renderizado si un payload viene con formato inesperado (`undefined` o `null`). Sin un `<ErrorBoundary>`, un fallo en el gráfico lunar o de donut deja toda la aplicación en una pantalla blanca para el usuario.

---

## 4. Matriz de Hallazgos y Prioridades

| Severidad | Área | Problema Detectado | Impacto Técnico / Laboral |
| :--- | :--- | :--- | :--- |
| 🔴 **CRÍTICA** | Backend / DAL | Bucle de Regex sobre miles de sueños en memoria de Node.js (`stats.dal.js`). | **Bloquea el Event Loop.** El servidor se congela con pocos usuarios recurrentes. |
| 🔴 **CRÍTICA** | Backend / Tests | Tests unitarios sobre un `MockDatabase` manual en memoria con `startsWith()`. | **Falsa sensación de seguridad.** Los tests pasan aunque las consultas SQL estén rotas. |
| 🟠 **ALTA** | Frontend / State | Cero uso de gestor de caché (`TanStack Query`). Todo con `useEffect` + `useState`. | Peticiones duplicadas, sin caché entre pantallas, estados desincronizados. |
| 🟠 **ALTA** | Backend / Arch | Arquitectura dividida: unos módulos tienen `service` y `Zod`, otros van directo a `dal`. | Demuestra falta de rigor arquitectónico y ensamblado por prompts sueltos. |
| 🟡 **MEDIA** | Frontend / CSS | Mezcla caótica de Bootstrap, CSS plano y estilos inline masivos. | Deuda técnica de diseño, difícil de mantener y recrea objetos en cada render. |
| 🟡 **MEDIA** | Backend / Storage | Guardado de archivos en disco local efímero sin compresión con `sharp`. | Pérdida de imágenes de usuarios al reiniciar contenedores en producción. |
| 🟢 **BAJA** | General / Vibe | Comentarios didácticos de IA y wrappers vacíos (`UIButton`). | En una revisión técnica, resta puntos de senioridad al candidato. |

---

## 5. Hoja de Ruta para Elevar el Proyecto a Nivel Senior

Para que este proyecto destaque de verdad en una prueba técnica o entrevista de alto nivel:

1. **Reemplazar el procesamiento en memoria de Node por SQL nativo:**  
   Reescribir las queries de frecuencia de palabras, símbolos y rachas lunares para que se ejecuten al 100% en PostgreSQL aprovechando índices y agregaciones.
2. **Eliminar `mockDb.js` y usar Testcontainers o base de datos de test real:**  
   Configurar una suite de integración con Docker (`postgres:16-alpine`) que ejecute las migraciones reales y verifique las sentencias SQL contra un motor PostgreSQL auténtico.
3. **Unificar la arquitectura del Backend:**  
   Hacer que `stats`, `glossary` y `dayNote` pasen rigurosamente por su capa de validación `Zod` y su capa de negocio `service.js`.
4. **Introducir TanStack Query en el Frontend:**  
   Sustituir los `useEffect` de carga de datos por queries y mutaciones con claves declarativas (`['stats', dateRange]`, `['dreams']`, `['tags']`).
5. **Limpieza de estilos y componentes:**  
   Extraer los estilos inline a clases reutilizables con variables CSS, y descomponer las vistas monolíticas (`Stats.jsx` y `Profile.jsx`) en submódulos especializados.
6. **Manejo de imágenes para producción:**  
   Integrar compresión con `sharp` y un adaptador de almacenamiento para S3 o Cloudflare R2 con URLs pre-firmadas o CDN.
