# 🌙 YumeNikki (夢日記) — Diario Onírico, Consciencia y Vigilia

**YumeNikki** es una plataforma web diseñada para registrar, explorar y analizar la actividad onírica nocturna, el desarrollo de la lucidez y el diálogo continuo entre el inconsciente y la vida consciente.

---

## 🔮 ¿De qué va YumeNikki?

Llevar un diario de sueños es uno de los ejercicios cognitivos y espirituales más transformadores para conectar con la mente profunda. Al despertar, la memoria onírica se disipa con rapidez; plasmarla por escrito entrena activamente la plasticidad cerebral, aumenta la vividez de las experiencias nocturnas y abre el camino hacia la **lucidez onírica** y el autoconocimiento.

YumeNikki trasciende el bloc de notas convencional articulando la práctica en torno a pilares fundamentales:

* 📝 **Crónica Onírica Modular**: Registro detallado de la narrativa nocturna, personajes, lugares, simbolismos, notas diurnas y galería de bocetos e ilustraciones.
* 🔮 **Dimensión Espiritual y Consciencia**: Incubación de sueños (intención o mantra antes de dormir y verificación matutina), niveles de lucidez (1 a 5), vividez perceptual, tipología sagrada (*Sombra, Premonitorio, Visita/Guía, Astral/OBE, etc.*), mensaje del inconsciente y compromiso de acción física en vigilia.
* ✨ **Sincronías Oníricas**: Registro de eventos, coincidencias y presentimientos cumplidos en la vida real que nacieron de un sueño, calculando automáticamente el tiempo transcurrido hasta su manifestación física.
* 📖 **Glosario Personal de Símbolos**: Tu propia enciclopedia de arquetipos y significados íntimos, con buscador, filtros y conteo automático de apariciones en tus relatos.
* 🏷️ **Taxonomía Onírica**: 8 etiquetas semilla por defecto (`SA`, `SL`, `P`, `VA`, etc.) con creación de etiquetas personalizadas y archivado inteligente.
* 🌌 **Motor Astronómico en Tiempo Real**: Cálculo matemático exacto de las **8 fases lunares** y del **signo del zodíaco tropical** a las 03:00 de la madrugada local (integración con `astronomy-engine` y ajuste automático DST).
* 🩸 **Correlación del Ciclo Menstrual**: Seguimiento biológico opcional con indicador visual en el calendario (🩸) y estadísticas comparativas entre fases hormonales y tipos de sueños.
* 📊 **Analítica del Inconsciente**: Cuadros de mando y gráficos interactivos (donuts por tipos de sueño, evolución temporal, radar lunar y distribución horaria).
* 🛡️ **Intimidad y Blindaje Anti-IA**: Centro legal oficial (`/legal`), soberanía absoluta del usuario sobre sus relatos y compromiso estricto de **cero entrenamiento de Inteligencia Artificial (Anti-AI Training)**.

> 📚 **¿Quieres ver en detalle todo lo que puedes hacer en la aplicación?**  
> Consulta la guía completa en **[`docs/FUNCIONALITIES.md`](docs/FUNCIONALITIES.md)**.

---

## 💻 Stack Tecnológico

El proyecto está construido bajo una arquitectura desacoplada y orientada a módulos limpios:

### Frontend (Client)
* **Framework**: React 18 con Vite (SPA de alto rendimiento).
* **Enrutamiento**: React Router v6.
* **Estilos y Diseño**: Bootstrap 5.3 + Sass (`theme.scss`) con tema cósmico oscuro, modo responsivo y fondo espacial interactivo en Canvas (`CosmicBackground`).
* **Visualización de Datos**: Recharts (gráficos Donut, Área y Radar).
* **Iconografía**: Lucide React.
* **Cliente HTTP**: Axios centralizado con interceptores y credenciales seguras.

### Backend (Server)
* **Entorno**: Node.js con Express (módulos ES).
* **Base de Datos**: PostgreSQL con cliente `pg` (Pool optimizado y consultas parametrizadas).
* **Autenticación**: JWT (JSON Web Tokens) transportados en cookies seguras `httpOnly` y cabeceras Bearer.
* **Criptografía**: `bcrypt` con salting para protección irreversible de contraseñas.
* **Motor Astronómico**: `astronomy-engine` (algoritmos orbitales y efemérides de alta precisión).
* **Gestión de Archivos**: Multer con borrado físico automatizado en disco de ilustraciones asociadas a sueños.
* **Seguridad**: Helmet, CORS restrictivo y Rate Limiting por IP.

---

## 📁 Estructura del Proyecto

```text
YumeNikki/
├── Client/                     # Frontend en React + Vite
│   ├── src/components/         # Componentes transversales (Logo, Navbar, CosmicBackground, UI)
│   ├── src/data/               # Datos legales y estáticos
│   ├── src/pages/              # Vistas principales:
│   │   ├── Home/               # Calendario mensual, tarjeta de hoy y DayPanel
│   │   ├── Dreams/             # Diario, Sincronías, Glosario, Detalle y Formulario
│   │   ├── Stats/              # Analítica interactiva y radar lunar
│   │   ├── Profile/            # Ajustes de perfil, seguridad y ciclo menstrual
│   │   └── Legal/              # Centro legal oficial con vista de impresión A4
│   └── src/routes/             # Enrutador protegido y público (AppRoutes)
├── Server/                     # Backend API en Node.js + Express
│   ├── config/                 # Conexión a PostgreSQL (db.js)
│   ├── database/               # Esquema oficial (schema.sql) y scripts de migración
│   ├── middlewares/            # verifyToken, upload (multer), errorHandler
│   ├── modules/                # Módulos de dominio:
│   │   ├── user/               # Registro, autenticación y perfiles
│   │   ├── dream/              # Crónica onírica e imágenes
│   │   ├── synchronicity/      # Sincronías y ecos en vigilia
│   │   ├── glossary/           # Glosario personal de símbolos
│   │   ├── tag/                # Taxonomía y archivado
│   │   ├── dayNote/            # Notas de vigilia
│   │   ├── menstrual/          # Historial y cálculo del ciclo
│   │   └── stats/              # Métricas y correlaciones
│   └── utils/                  # Cálculos lunares (astronomy-engine) y JWT
├── docs/                       # Documentación del proyecto
│   ├── FUNCIONALITIES.md       # Catálogo exhaustivo de funcionalidades
│   └── ARQUITECTURA.md         # Decisiones de diseño y arquitectura técnica
└── docker-compose.yml          # Contenedor local para PostgreSQL (puerto 5434)
```

---

## 🚀 Puesta en Marcha Local

### 1. Base de Datos (Docker)
```bash
docker-compose up -d
```
*(Inicia PostgreSQL en el puerto `5434` según la configuración de entorno).*

### 2. Migraciones de Base de Datos
```bash
cd Server
npm run db:migrate
```
*(Aplica automáticamente el esquema relacional, extensiones trigrama e índices con control de versiones en `schema_migrations`).*

### 3. Servidor Backend
```bash
cd Server
npm install
npm run dev
```

### 4. Cliente Frontend
```bash
cd Client
npm install
npm run dev
```

La aplicación estará accesible en tu navegador en `http://localhost:5173`.

---

## 🧪 Pruebas Automatizadas (Testing)

Ambos proyectos cuentan con suites de pruebas unitarias y de integración listas para CI/CD:

```bash
# Pruebas de Backend (41 tests - Node Test Runner)
cd Server
npm test

# Pruebas de Frontend (14 tests - Vitest + React Testing Library)
cd Client
npm test
```

---

## 📚 Documentación Adicional

* 📖 **[Guía de Funcionalidades (`docs/FUNCIONALITIES.md`)](docs/FUNCIONALITIES.md)**: Explicación detallada de cada módulo, herramientas de consciencia y atajos.
* 🏛️ **[Arquitectura y Decisiones Técnicas (`docs/ARQUITECTURA.md`)](docs/ARQUITECTURA.md)**: Flujo en 4 capas (`Route -> Controller -> Service -> DAL`), transacciones ACID, persistencia cloud y seguridad.
* 📋 **[Plan de Implementación y Modernización (`docs/plan_implementacion.md`)](docs/plan_implementacion.md)**: Registro exhaustivo de auditoría y fases ejecutadas.
* ⚖️ **Centro Legal y Privacidad**: Consulta directa en la aplicación en `/legal` o a través del botón flotante de ayuda (`?`).