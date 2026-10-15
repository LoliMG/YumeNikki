import api from './api';

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈︎', min: 0, max: 30 },
  { name: 'Tauro', symbol: '♉︎', min: 30, max: 60 },
  { name: 'Géminis', symbol: '♊︎', min: 60, max: 90 },
  { name: 'Cáncer', symbol: '♋︎', min: 90, max: 120 },
  { name: 'Leo', symbol: '♌︎', min: 120, max: 150 },
  { name: 'Virgo', symbol: '♍︎', min: 150, max: 180 },
  { name: 'Libra', symbol: '♎︎', min: 180, max: 210 },
  { name: 'Escorpio', symbol: '♏︎', min: 210, max: 240 },
  { name: 'Sagitario', symbol: '♐︎', min: 240, max: 270 },
  { name: 'Capricornio', symbol: '♑︎', min: 270, max: 300 },
  { name: 'Acuario', symbol: '♒︎', min: 300, max: 330 },
  { name: 'Piscis', symbol: '♓︎', min: 330, max: 360 }
];

const HALF_WINDOW_DEG = (360 / 29.530588853) / 2; // ~6.095°
const SYNODIC_MONTH = 29.53058867; // días
// Referencia de Luna Nueva: 6 de enero de 2000 a las 18:14 UTC
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

// Caché en memoria para evitar peticiones duplicadas
const moonCache = new Map();

/**
 * Normaliza y formatea detalles de la fase lunar a partir del ángulo sinódico.
 */
export function getMoonPhaseDetails(phaseAngle) {
  const normAngle = ((phaseAngle % 360) + 360) % 360;

  if (normAngle >= 360 - HALF_WINDOW_DEG || normAngle < HALF_WINDOW_DEG) {
    return { name: 'Luna nueva', emoji: '🌑' };
  }
  if (normAngle < 90 - HALF_WINDOW_DEG) {
    return { name: 'Luna creciente', emoji: '🌒' };
  }
  if (normAngle < 90 + HALF_WINDOW_DEG) {
    return { name: 'Cuarto creciente', emoji: '🌓' };
  }
  if (normAngle < 180 - HALF_WINDOW_DEG) {
    return { name: 'Gibosa creciente', emoji: '🌔' };
  }
  if (normAngle < 180 + HALF_WINDOW_DEG) {
    return { name: 'Luna llena', emoji: '🌕' };
  }
  if (normAngle < 270 - HALF_WINDOW_DEG) {
    return { name: 'Gibosa menguante', emoji: '🌖' };
  }
  if (normAngle < 270 + HALF_WINDOW_DEG) {
    return { name: 'Cuarto menguante', emoji: '🌗' };
  }
  return { name: 'Luna menguante', emoji: '🌘' };
}

/**
 * Aproximación trigonométrica / astronómica de posición del signo lunar.
 */
export function getApproxZodiacSign(dateObj) {
  // El ciclo sideral lunar dura ~27.32166 días
  const SIDEREAL_MONTH = 27.321661;
  // Referencia conocida: Luna entrando en Aries ~11 Enero 2000 14:00 UTC
  const REF_ARIES_UTC = Date.UTC(2000, 0, 11, 14, 0, 0);
  const diffDays = (dateObj.getTime() - REF_ARIES_UTC) / (1000 * 60 * 60 * 24);
  const cycleFrac = ((diffDays % SIDEREAL_MONTH) + SIDEREAL_MONTH) % SIDEREAL_MONTH;
  const degrees = (cycleFrac / SIDEREAL_MONTH) * 360;
  const signIndex = Math.floor(degrees / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  return { name: sign.name, symbol: sign.symbol };
}

/**
 * Cálculo síncrono ultra-ligero (0 dependencias) para renderizado inmediato en cliente.
 * Si ya está en la caché recibida del Backend, usa el valor exacto del servidor.
 */
export function calculateMoonForDate(dateInput, timezone = 'Europe/Madrid') {
  let dateStr;
  if (typeof dateInput === 'string') {
    dateStr = dateInput.split('T')[0];
  } else if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().split('T')[0];
  } else {
    dateStr = new Date().toISOString().split('T')[0];
  }

  const cacheKey = `${dateStr}_${timezone}`;
  if (moonCache.has(cacheKey)) {
    return moonCache.get(cacheKey);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  // Fijar las 03:00 de la noche
  const targetUtc = new Date(Date.UTC(year, (month || 1) - 1, day || 1, 3, 0, 0));
  const diffDays = (targetUtc.getTime() - KNOWN_NEW_MOON_UTC) / (1000 * 60 * 60 * 24);
  const phaseCycle = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseAngle = (phaseCycle / SYNODIC_MONTH) * 360;

  const phase = getMoonPhaseDetails(phaseAngle);
  const zodiac = getApproxZodiacSign(targetUtc);

  const result = {
    phaseName: phase.name,
    phaseEmoji: phase.emoji,
    zodiacSign: zodiac.name,
    zodiacSymbol: zodiac.symbol,
    calculationDate: targetUtc
  };

  moonCache.set(cacheKey, result);
  return result;
}

/**
 * Consulta el servidor para obtener los datos lunares exactos de una fecha concreta.
 */
export async function fetchMoonForDate(dateStr, timezone = 'Europe/Madrid') {
  const cacheKey = `${dateStr}_${timezone}`;
  try {
    const res = await api.get(`/stats/moon?date=${dateStr}&timezone=${encodeURIComponent(timezone)}`);
    if (res?.moon) {
      moonCache.set(cacheKey, res.moon);
      return res.moon;
    }
  } catch (err) {
    console.warn(`[moonHelper] Fallback local para ${dateStr}:`, err);
  }
  return calculateMoonForDate(dateStr, timezone);
}

/**
 * Consulta el servidor para obtener el mapa mensual de lunas y poblar la caché del calendario.
 */
export async function fetchMoonsForMonth(yearMonth, timezone = 'Europe/Madrid') {
  try {
    const res = await api.get(`/stats/moon?month=${yearMonth}&timezone=${encodeURIComponent(timezone)}`);
    if (res?.moons) {
      for (const [d, m] of Object.entries(res.moons)) {
        moonCache.set(`${d}_${timezone}`, m);
      }
      return res.moons;
    }
  } catch (err) {
    console.warn(`[moonHelper] Fallback local mensual para ${yearMonth}:`, err);
  }
  return null;
}

export default {
  calculateMoonForDate,
  fetchMoonForDate,
  fetchMoonsForMonth,
  getMoonPhaseDetails,
  ZODIAC_SIGNS
};
