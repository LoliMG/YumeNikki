# 📖 Guía de Funcionalidades — YumeNikki (夢日記)

Esta guía detalla **todas las funcionalidades y herramientas** disponibles dentro de **YumeNikki**, diseñadas para acompañar la práctica onírica desde la preparación previa al descanso hasta la integración lúcida y consciente en la vigilia.

---

## 🧭 Índice de Módulos

1. [Registro y Crónica Onírica](#1-registro-y-crónica-onírica)
2. [Dimensión Espiritual y Consciencia](#2-dimensión-espiritual-y-consciencia)
3. [Sincronías Oníricas (Ecos en Vigilia)](#3-sincronías-oníricas-ecos-en-vigilia)
4. [Glosario Personal de Símbolos y Arquetipos](#4-glosario-personal-de-símbolos-y-arquetipos)
5. [Taxonomía Onírica (Gestión de Etiquetas)](#5-taxonomía-onírica-gestión-de-etiquetas)
6. [Calendario Onírico y Motor Astronómico](#6-calendario-onírico-y-motor-astronómico)
7. [Ciclo Menstrual y Correlación Biológica](#7-ciclo-menstrual-y-correlación-biológica)
8. [Analítica y Estadísticas del Inconsciente](#8-analítica-y-estadísticas-del-inconsciente)
9. [Centro Legal, Intimidad y Protección Anti-IA](#9-centro-legal-intimidad-y-protección-anti-ia)
10. [Perfil, Ajustes y Privacidad](#10-perfil-ajustes-y-privacidad)

---

## 1. Registro y Crónica Onírica

El núcleo de la aplicación es su diario íntimo de sueños, diseñado con un flujo sin distracciones:

* **Formulario Modular de Sueños (`/dreams/new` y `/dreams/:id/edit`)**:
  * **Metadatos Temporales**: Fecha y hora del sueño. La hora se fija de forma estática en el momento de creación para reflejar con exactitud la hora de despertar.
  * **Título Opcional / Relato Libre**: Flexibilidad para guardar sueños breves o narrativas extensas.
  * **Elementos Desglosados**: Campos específicos para catalogar **Personajes**, **Lugares** y **Simbolismos**.
  * **Notas Diurnas**: Espacio para reflexiones diurnas añadidas a posteriori.
  * **Galería Visual**: Subida y gestión de ilustraciones, fotos de cuadernos físicos, bocetos o arte onírico (con visor a pantalla completa).
  * **Diseño adaptado a móvil**: Cabecera limpia con botón de retroceso compacto y acciones principales al pie del formulario.

* **Ficha de Detalle del Sueño (`/dreams/:id`)**:
  * Lectura inmersiva con tipografía serif cuidada sobre fondo cósmico.
  * Badges de fase lunar, signo zodiacal y etiqueta.
  * Paneles para personajes, lugares, notas e ilustraciones.
  * Bloque de dimensión espiritual con tarjeta de oráculo.
  * Listado de sincronías en la vida real vinculadas al sueño.

* **Listado y Filtros Avanzados (`/dreams`)**:
  * Agrupación cronológica por días.
  * Buscador en tiempo real por palabras clave.
  * Filtros combinados por etiqueta, fechas, personajes, lugares y símbolos.

---

## 2. Dimensión Espiritual y Consciencia

Para soñadores lúcidos, terapeutas transpersonales y practicantes de yoga del sueño, el formulario incluye una sección consagrada a la introspección profunda:

* **Incubación del Sueño (Antes de dormir)**:
  * Campo para plasmar la **Intención nocturna o Mantra** antes de cerrar los ojos (*ej. "Pido claridad en mi vocación"*, *"Intención de lucidez"*).
  * Verificación matutina: Casilla interactiva *«¿El sueño respondió a esta intención?»*.
* **Espectro de Consciencia**:
  * **Nivel de Lucidez (Escala 1 a 5)**: Desde *1 (Inconsciente / Ordinario)* hasta *5 (Lúcido Creador / Control absoluto)*.
  * **Vividez Perceptual (Escala 1 a 5)**: Desde *1 (Fragmentado o borroso)* hasta *5 (Hiperrealista / Sensación más tangible que la vigilia)*.
* **Tipología Onírica Sagrada**:
  * Clasificación arquetípica en un clic: *Estándar*, *Trabajo de Sombra (Jung)*, *Premonitorio*, *Visita / Guía espiritual*, *Viaje Astral / OBE*, *Sanación / Curativo*, o *Recurrente*.
* **Prácticas de Inducción Previas**:
  * Selección de técnicas empleadas la noche anterior: *Meditación previa, Infusión para soñar (artemisa, pasiflora), Técnica MILD/WILD, Silencio digital, Cristales / Minerales, Respiración consciente, Chequeos de realidad*.
* **Integración en Vigilia**:
  * **Mensaje del Inconsciente**: Una sola frase que resume la lección esencial entregada por el alma.
  * **Acción o Microritual en Vigilia**: Compromiso consciente en el mundo físico para honrar y anclar el mensaje del sueño (*«Un sueño no llevado a la acción es como una carta que nunca se abre»*).

---

## 3. Sincronías Oníricas (Ecos en Vigilia)

Disponible en la pestaña **Sincronías** (`/dreams/synchronicities`):

* **Puente Sueño $\leftrightarrow$ Realidad**: Registro de eventos, coincidencias asombrosas o presentimientos cumplidos en la vida real que guardan conexión directa con un sueño previo.
* **Página Dedicada de Registro y Edición (`/dreams/synchronicities/new` y `/dreams/synchronicities/:id/edit`)**:
  * Amplio espacio visual y narrativo para plasmar detalladamente la experiencia física.
  * **Buscador y Filtrado de Sueño Origen**:
    * Buscador en vivo que filtra instantáneamente entre cientos de sueños por título, palabras clave del relato, fecha (AAAA-MM-DD) o etiquetas.
    * Filtros rápidos con un clic (sueños lúcidos, etiquetas personalizadas).
    * Tarjeta de previsualización destacada del sueño origen seleccionado (fecha, fase lunar, etiqueta, título y extracto) con opción para cambiarlo con total comodidad.
* **Cálculo de Manifestación Temporal**: La aplicación calcula automáticamente los días transcurridos entre la noche del sueño y el día del evento en el mundo físico (*ej. "Manifestado el mismo día"*, *"+5 días tras el sueño"*).
* **Vinculación Directa**:
  * Se puede crear desde la propia sección de Sincronías seleccionando el sueño origen, o directamente desde el botón *«+ Registrar sincronía»* de la ficha de cualquier sueño individual (`/dreams/:id`).
* **Buscador de Sincronías**: Búsqueda libre por título, descripción o título del sueño vinculado.

---

## 4. Glosario Personal de Símbolos y Arquetipos

Disponible en la pestaña **Glosario & Etiquetas** (`/dreams/glossary`):

* **Enciclopedia Propia del Soñador**:
  * Permite registrar símbolos recurrentes (*el agua, las llaves, la serpiente, las puertas, los espejos*) y documentar qué significan íntimamente para el usuario, superando los diccionarios genéricos de internet.
* **Asociación Arquetípica**:
  * Asigna categorías como *Sombra*, *Ánima/Ánimus*, *Transformación*, *Portal/Umbral*, *Sanación* o *Guía*.
* **Conteo Automático de Apariciones**:
  * La plataforma detecta automáticamente en cuántos sueños aparece cada símbolo y proporciona un enlace directo para abrir todos los sueños relacionados.
* **Buscador y Filtro por Arquetipo**:
  * Localización instantánea de símbolos y filtrado por familias arquetípicas.

---

## 5. Taxonomía Onírica (Gestión de Etiquetas)

Reubicada en la pestaña **Glosario & Etiquetas** (`/dreams/glossary`):

* **8 Etiquetas Semilla por Defecto**:
  * `SA` (Sueño Agitado)
  * `ST` (Sueño Tranquilo)
  * `P` (Pesadilla)
  * `SP` (Sueño Premonitorio)
  * `SS` (Sueño Significativo)
  * `SR` (Sueño Recurrente)
  * `SL` (Sueño Lúcido)
  * `VA` (Viaje Astral / Parálisis)
* **Creación y Edición Libre**:
  * Nombre, color representativo en paleta cósmica e iniciales compactas (para visualización limpia en gráficos y móvil).
* **Borrado Seguro y Resolución de Conflictos**:
  * Si la etiqueta está en uso en sueños existentes, el sistema ofrece archivarla (para que no aparezca en nuevos registros pero se mantenga en el histórico) o reasignar los sueños asociados a otra etiqueta.

---

## 6. Calendario Onírico y Motor Astronómico

Ubicado en la pantalla de inicio (`/`):

* **Calendario Mensual Cósmico**:
  * Celdas interactivas con indicador de sueños registrados, notas de vigilia, fases lunares y alertas menstruales.
* **Motor Astronómico Preciso (`astronomy-engine`)**:
  * Cálculo matemático real de las **8 fases lunares** (Luna Nueva, Creciente, Cuarto Creciente, Gibosa Creciente, Luna Llena, Gibosa Menguante, Cuarto Menguante, Menguante).
  * Cálculo del **Signo del Zodíaco Tropical** en el que se encuentra la Luna a las 03:00 de la madrugada en la zona horaria del usuario (respetando horario de verano/invierno DST).
* **Tarjeta de Hoy**:
  * Widget en tiempo real con el emoji lunar, la fase actual y el tránsito zodiacal de la noche en curso.
* **Panel Lateral del Día (`DayPanel`)**:
  * Vista rápida de todos los sueños y notas de la fecha seleccionada con accesos directos para editar, crear o alternar el sangrado biológico.

---

## 7. Ciclo Menstrual y Correlación Biológica

Diseñado para explorar la relación entre las fases hormonales y la narrativa onírica:

* **Configuración de Género Inteligente**:
  * Selector en el perfil (`Mujer`, `Hombre`, `Otro`). Si el usuario selecciona hombre, la funcionalidad del ciclo se desactiva para mantener la interfaz sobria y adaptada.
* **Registro de Periodos y Sangrado**:
  * Marcado de días de sangrado desde el calendario con un icono de gota roja 🩸.
  * Creación y gestión de periodos menstruales en el perfil.
* **Métricas Dinámicas**:
  * Duración media de sangrado calculada por el historial real.
  * Duración media del ciclo calculada entre los días transcurridos entre inicios de periodos sucesivos.
* **Estadísticas de Correlación Onírica**:
  * Comparación de la frecuencia de tipos de sueños (lúcidos, pesadillas, agitados) durante la menstruación frente a las demás fases del ciclo.

---

## 8. Analítica y Estadísticas del Inconsciente

Disponible en `/stats`:

* **Racha y Frecuencia**: Total de sueños registrados y racha actual de noches consecutivas documentando.
* **Distribución por Tipos de Sueño (Gráfica Donut)**:
  * Gráfico interactivo por etiquetas con siglas compactas (`SA`, `SL`, `P`, etc.).
  * Desglose lateral con tarjetas translúcidas fijas (sin saltos ni scroll horizontal).
* **Evolución Temporal de Sueños**: Gráfico de área con el volumen de actividad onírica mes a mes.
* **Radar Lunar de Doble Modo (Fases y Frecuencia Onírica)**:
  * **Modo Total de Sueños**: Visualiza la cantidad global de sueños en cada una de las 8 fases lunares (desde Luna Nueva hasta Luna Menguante).
  * **Modo Por Tipo de Sueño (Etiqueta)**: Selector interactivo que permite elegir una etiqueta específica (*ej. Lúcidos, Premonitorios, Pesadillas*) para analizar en qué fase lunar se manifiesta con mayor frecuencia, adaptando la estética y color del gráfico al tono de la etiqueta.
  * **Panel de Desglose y Fase Predominante**: Tarjeta con la fase lunar más activa para el filtro seleccionado, junto con una tabla visual de las 8 fases con sus barras de progreso y porcentajes.
* **Filtro Temporal**: Selector de rango de fechas para consultar estadísticas de cualquier período.

---

## 9. Centro Legal, Intimidad y Protección Anti-IA

Accesible desde el botón flotante de ayuda (`?`) en la esquina inferior derecha o en `/legal`:

* **Botón Flotante Discreto**:
  * Botón circular translúcido con efecto hover cósmico y tooltip explicativo. Se oculta automáticamente cuando se está dentro del centro legal.
* **Aviso Legal (LSSI-CE)**:
  * Identificación oficial y naturaleza introspectiva no médica de la plataforma.
* **Condiciones de Uso — Propiedad y Blindaje Anti-IA**:
  * **100% Propiedad del Usuario**: Todos los relatos, notas e imágenes pertenecen con exclusividad al soñador.
  * **Blindaje Anti-Entrenamiento de IA (Anti-AI Training)**: Compromiso estricto de que ningún sueño o texto se utilizará para alimentar, afinar ni entrenar modelos de Inteligencia Artificial (LLMs).
* **Política de Privacidad (RGPD y LOPDGDD)**:
  * Tratamiento de datos íntimos, consentimiento voluntario para datos de ciclo biológico (Art. 9 RGPD), cero cesiones a anunciantes y ejercicio de derechos ARCO-POL con opción de borrado inmediato e irreversible.
* **Política de Cookies Limpia**:
  * Cero cookies publicitarias ni trackers de terceros. Solo almacenamiento web técnico imprescindible (`token`, `user`, preferencias).
* **Soporte Oficial de Impresión**: Estilos `@media print` optimizados para imprimir o exportar en PDF en formato A4 limpio.

---

## 10. Perfil, Ajustes y Privacidad

Disponible en `/profile`:

* **Información Personal**:
  * Avatar con foto de perfil interactiva (subida y eliminación directa al pulsar sobre la imagen).
  * Nombre de usuario y correo electrónico editable.
  * Selector de zona horaria con buscador amigable.
* **Ajustes y Seguridad**:
  * Cambio de contraseña cifrada con bcrypt.
  * Zona de peligro para la **eliminación permanente de cuenta** (borrado en cascada inmediato de todos los sueños, notas, imágenes y etiquetas del usuario).
* **Gestión del Ciclo Menstrual**:
  * Historial de periodos registrados, fechas de inicio y fin, y actualización de métricas del ciclo biológico.
