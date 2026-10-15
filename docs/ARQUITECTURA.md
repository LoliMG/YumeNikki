# 🏛️ YumeNikki — Arquitectura Técnica y Estructura del Proyecto

> Documento técnico orientado a evaluación de ingeniería de software, arquitectura full-stack y metodología de desarrollo para perfiles técnicos y *Tech Recruiters*.

---

## 📌 1. Resumen Ejecutivo

**YumeNikki** es una plataforma web full-stack desacoplada diseñada bajo principios de **arquitectura modular por capas**, alta cohesión y bajo acoplamiento. 

El proyecto resuelve un dominio que combina:
- **Gestión cronológica de datos oníricos** con tiempos estáticos e inmutables.
- **Cálculo astronómico y posicional centralizado en backend** (fases lunares y tránsitos zodiacales tropicales con compensación de husos horarios y horario de verano/invierno DST).
- **Transaccionalidad ACID**: persistencia atómica de relatos e imágenes mediante clientes transaccionales del pool de PostgreSQL.
- **Minería de texto agregada en base de datos**: tokenización, filtrado de *stopwords* y conteo léxico delegado al motor SQL.
- **Abstracción de almacenamiento (Storage Adapter Pattern)**: soporte agnóstico para desarrollo local en disco y producción en la nube (AWS S3 / Cloudflare R2 / Supabase Storage).
- **Seguridad web endurecida**: autenticación mediante JWT encapsulado en cookies `httpOnly` con banderas de seguridad `sameSite` y cabeceras defensivas (Helmet).
- **Estrategia integral de testing**: 41 pruebas automatizadas en backend (`node:test`) y 14 pruebas unitarias de interfaz en frontend (**Vitest** + **React Testing Library**).

---

## 🛠️ 2. Stack Tecnológico

| Capa | Tecnologías | Propósito & Decisiones Técnicas |
| :--- | :--- | :--- |
| **Frontend** | **React 18**, **Vite**, **Sass**, **Bootstrap 5.3**, **Lucide Icons** | SPA reactiva optimizada. Sistema de diseño unificado en Sass (`theme.scss`) con configuración previa de `$theme-colors` sin abuso de `!important`. |
| **Testing Frontend** | **Vitest**, **@testing-library/react**, **jsdom** | Pruebas de integración de componentes (`AuthContext`, `UIDropdown`, `CalendarView`, `MoonBadge`) ejecutadas en < 2 segundos. |
| **Backend** | **Node.js (ESM)**, **Express.js** | Arquitectura en 4 capas estrictas (`Route -> Controller -> Service -> DAL`). Controladores libres de lógica de negocio o queries SQL. |
| **Base de Datos** | **PostgreSQL 16**, **Docker Compose** | Motor relacional con integridad referencial, índices de trigramas (`pg_trgm`) GIN y control de versiones con tabla `schema_migrations`. |
| **Seguridad** | **JWT**, **Cookies `httpOnly`**, **Helmet**, **express-rate-limit**, **bcryptjs** | Mitigación de XSS (tokens inaccesibles por JS) y CSRF; rate limiting contra ataques de fuerza bruta; hash salted irreversible. |
| **Dominio & Astronomía**| **`astronomy-engine`** | Mecánica celeste y trigonometría esférica de alta precisión ejecutada exclusivamente en servidor para reducir el bundle cliente (-64%). |
| **Almacenamiento** | **Storage Adapter (`storageAdapter.js`)** | Persistencia desacoplada del sistema de archivos local para despliegues stateless en PaaS (Render, Railway, Fly.io). |
| **Testing Backend** | **Node Test Runner (`node:test`, `node:assert`)** | Batería de 41 pruebas unitarias y de integración rápida (< 1s), con inversión de control para mocks de DAL sin parsing manual de SQL. |

---

## 🔄 3. Arquitectura en 4 Capas y Flujo de Datos

El backend implementa una separación estricta de responsabilidades en cuatro capas unidireccionales:

```
[ Navegador Web (React SPA) ]
         │
         │  1. Petición HTTP (CORS con credentials: 'include')
         ▼
[ Express Pipeline (Middlewares) ]
    ├─► Helmet (Cabeceras de seguridad CSP & CORP)
    ├─► CORS Whitelist (Origen controlado con credenciales habilitadas)
    ├─► Rate Limiter (Ventana de 15 min / 600 reqs anti DoS)
    ├─► Cookie Parser & Auth Guard (`verifyToken` valida JWT httpOnly)
    └─► Multer / Storage Adapter (Manejo de archivos multipart)
         │
         │  2. Despacho a Rutas
         ▼
[ Controladores (`*.controller.js`) ]
    Responsabilidad exclusiva: lectura de req (body, query, params),
    llamada a la capa de servicio y emisión de res (status codes y JSON).
         │
         │  3. Invocación de Servicio
         ▼
[ Capa de Servicios (`*.service.js`) ]
    Responsabilidad exclusiva: reglas de negocio (ej. restricción de ciclo menstrual
    para hombres, validación de contenido/título, transacciones ACID, hashing y borrado físico).
         │
         │  4. Consultas y Persistencia
         ▼
[ Capa de Acceso a Datos (`*.dal.js`) ]
    Responsabilidad exclusiva: construcción de sentencias SQL parametrizadas
    y ejecución mediante el pool de conexiones o cliente transaccional.
         │
         ▼
[ PostgreSQL Pool (`pg`) ]
```

### Transaccionalidad ACID (`withTransaction`)
Para operaciones compuestas (como la creación de un sueño y la subida de sus imágenes adjuntas), se utiliza la función helper de orden superior `withTransaction`:
- Adquiere un cliente dedicado del pool: `const client = await pool.connect();`
- Abre el bloque atómico: `await client.query('BEGIN');`
- Ejecuta las operaciones del callback pasando el cliente activo.
- Si todas tienen éxito: emite `COMMIT`.
- Si alguna operación falla: ejecuta `ROLLBACK` y propaga la excepción, garantizando en el bloque `finally` la liberación del recurso: `client.release()`.

### Desacoplamiento de Efemérides Astronómicas
Anteriormente, la librería `astronomy-engine` estaba duplicada en el cliente y el servidor, aumentando el chunk principal en ~70 KB. Se refactorizó delegando el cálculo al endpoint `/api/stats/moon` en el servidor, acompañado de una capa de caché en memoria en [`moonHelper.js`](../Client/src/helpers/moonHelper.js). Esto redujo el tamaño del bundle de la vista principal de **75.9 KB a 27.38 KB** (-64%).

---

## 📂 4. Estructura del Código

```text
YumeNikki/
├── Client/                         # Frontend SPA (React 18 + Vite)
│   ├── src/
│   │   ├── components/             # Componentes transversales (CosmicBackground en Canvas, UI, Navbar)
│   │   ├── contexts/               # Estado global reactivo (AuthContext + hook useAuth)
│   │   ├── helpers/                # Clientes API unificados y helpers lunares (moonHelper.js)
│   │   ├── pages/                  # Vistas modulares: Home, Dreams, Stats, Profile, Legal
│   │   ├── styles/                 # Sistema de diseño centralizado (theme.scss)
│   │   └── __tests__/              # Pruebas con Vitest (AuthContext, UIDropdown, CalendarView, MoonBadge)
│   └── vite.config.js              # Configuración de empaquetado, proxies y Vitest
│
├── Server/                         # Backend REST API (Node.js ESM + Express)
│   ├── config/                     # Conexión al pool de PostgreSQL y helper withTransaction
│   ├── database/                   # DDL de esquema (schema.sql) y runner formal de migraciones (migrate.js)
│   ├── middlewares/                # verifyToken, multer adaptativo, rate-limiting, error handler
│   ├── modules/                    # Módulos verticales limpios (Route -> Controller -> Service -> DAL):
│   │   ├── user/                   # Autenticación, perfiles y preferencias
│   │   ├── dream/                  # Crónica onírica, adjuntos multimedia y transacciones
│   │   ├── tag/                    # Taxonomía onírica con archivado suave vs desvinculación
│   │   ├── dayNote/                # Notas de vigilia y marcado diario
│   │   ├── menstrual/              # Seguimiento fisiológico y cálculos dinámicos de ciclo
│   │   ├── synchronicity/          # Sincronías y ecos oníricos en vigilia
│   │   ├── glossary/               # Glosario personal de símbolos y arquetipos
│   │   └── stats/                  # Analítica léxica en SQL, cruces lunares y distribución horaria
│   ├── utils/                      # Storage adapter (local/S3), cálculo lunar y criptografía JWT/bcrypt
│   └── tests/                      # Suite de 41 tests unitarios y de integración (Node Test Runner)
│
├── docs/                           # Documentación técnica, arquitectura y planes de implementación
└── docker-compose.yml              # Aprovisionamiento local de PostgreSQL (puerto 5434)
```

---

## 💡 5. Metodología de Desarrollo y Control de Calidad

El proyecto fue desarrollado mediante una metodología iterativa con asistencia de herramientas de IA como acelerador técnico, bajo una estricta dirección y supervisión humana:

1. **Criterio Arquitectónico y Supervisión Humana**:
   - Definición funcional y matemática de las reglas de dominio (fechas estáticas inmutables, ciclo menstrual sin valores arbitrarios ficticios, cálculo a las 03:00 con compensación DST).
   - Diseño visual y usabilidad: paleta armónica en modo oscuro, accesibilidad WCAG (`aria-label`, navegación por teclado con `Escape` y flechas), y rendimiento gráfico migrado de DOM masivo a Canvas 2D.
   - Auditoría estricta de código: saneamiento de *code smells*, erradicación de `!important` en SCSS y supresión de falsos mocks SQL artesanales.

2. **Aceleración Asistida**:
   - Generación de *scaffolding* para migraciones y adaptadores de almacenamiento.
   - Cobertura de pruebas unitarias automatizadas tanto en cliente (Vitest) como en servidor (Node Test Runner).
