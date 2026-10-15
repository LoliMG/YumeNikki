import * as Astronomy from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈\uFE0E', min: 0, max: 30 },
  { name: 'Tauro', symbol: '♉\uFE0E', min: 30, max: 60 },
  { name: 'Géminis', symbol: '♊\uFE0E', min: 60, max: 90 },
  { name: 'Cáncer', symbol: '♋\uFE0E', min: 90, max: 120 },
  { name: 'Leo', symbol: '♌\uFE0E', min: 120, max: 150 },
  { name: 'Virgo', symbol: '♍\uFE0E', min: 150, max: 180 },
  { name: 'Libra', symbol: '♎\uFE0E', min: 180, max: 210 },
  { name: 'Escorpio', symbol: '♏\uFE0E', min: 210, max: 240 },
  { name: 'Sagitario', symbol: '♐\uFE0E', min: 240, max: 270 },
  { name: 'Capricornio', symbol: '♑\uFE0E', min: 270, max: 300 },
  { name: 'Acuario', symbol: '♒\uFE0E', min: 300, max: 330 },
  { name: 'Piscis', symbol: '♓\uFE0E', min: 330, max: 360 }
];

// Ventana de 1 día (±0.5 días en órbita sinódica de 29.53 días ≈ ±6.095°)
const HALF_WINDOW_DEG = (360 / 29.530588853) / 2; // ~6.095°

/**
 * Obtiene el instante UTC exacto correspondiente a las 03:00 en la zona horaria del usuario.
 * @param {string|Date} dateInput - Fecha en formato 'YYYY-MM-DD' o Date
 * @param {string} timeZone - Zona horaria IANA (ej. 'Europe/Madrid')
 * @returns {Date} Instante UTC correspondiente a las 03:00 hora local
 */
export function getLocalNightDateAt3AM(dateInput, timeZone = 'Europe/Madrid') {
  let dateStr;
  if (typeof dateInput === 'string') {
    dateStr = dateInput.split('T')[0];
  } else if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().split('T')[0];
  } else {
    throw new Error('Formato de fecha inválido para el cálculo lunar.');
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const approxUtc = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = Object.fromEntries(formatter.formatToParts(approxUtc).map(p => [p.type, p.value]));
  const zonedTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  const offsetMs = zonedTimestamp - approxUtc.getTime();
  return new Date(approxUtc.getTime() - offsetMs);
}

/**
 * Determina la fase lunar a partir del ángulo de fase sinódico (0° a 360°).
 * Las 4 fases cardinales tienen una ventana de ~1 día centrada en su punto exacto.
 */
export function getMoonPhaseDetails(phaseAngle) {
  const normAngle = ((phaseAngle % 360) + 360) % 360;

  // Luna nueva (0° ± 6.095°)
  if (normAngle >= 360 - HALF_WINDOW_DEG || normAngle < HALF_WINDOW_DEG) {
    return { name: 'Luna nueva', emoji: '🌑' };
  }
  // Luna creciente / Creciente cóncava
  if (normAngle < 90 - HALF_WINDOW_DEG) {
    return { name: 'Luna creciente', emoji: '🌒' };
  }
  // Cuarto creciente (90° ± 6.095°)
  if (normAngle < 90 + HALF_WINDOW_DEG) {
    return { name: 'Cuarto creciente', emoji: '🌓' };
  }
  // Gibosa creciente / Creciente convexa
  if (normAngle < 180 - HALF_WINDOW_DEG) {
    return { name: 'Gibosa creciente', emoji: '🌔' };
  }
  // Luna llena (180° ± 6.095°)
  if (normAngle < 180 + HALF_WINDOW_DEG) {
    return { name: 'Luna llena', emoji: '🌕' };
  }
  // Gibosa menguante / Menguante convexa
  if (normAngle < 270 - HALF_WINDOW_DEG) {
    return { name: 'Gibosa menguante', emoji: '🌖' };
  }
  // Cuarto menguante (270° ± 6.095°)
  if (normAngle < 270 + HALF_WINDOW_DEG) {
    return { name: 'Cuarto menguante', emoji: '🌗' };
  }
  // Luna menguante / Menguante cóncava
  return { name: 'Luna menguante', emoji: '🌘' };
}

/**
 * Calcula el signo zodiacal tropical de la Luna basado en la longitud eclíptica.
 */
export function getTropicalZodiacSign(eclipticLongitude) {
  const normLon = ((eclipticLongitude % 360) + 360) % 360;
  for (const sign of ZODIAC_SIGNS) {
    if (normLon >= sign.min && normLon < sign.max) {
      return { name: sign.name, symbol: sign.symbol };
    }
  }
  return { name: 'Piscis', symbol: '♓\uFE0E' };
}

/**
 * Función principal: calcula la luna y signo lunar para una fecha D tomada a las 03:00 hora local.
 * @param {string|Date} dreamDate - Fecha D ('YYYY-MM-DD')
 * @param {string} userTimeZone - Zona horaria del usuario (por defecto 'Europe/Madrid')
 * @returns {{ phaseName: string, phaseEmoji: string, zodiacSign: string, zodiacSymbol: string, calculationDate: Date }}
 */
export function calculateMoonForDate(dreamDate, userTimeZone = 'Europe/Madrid') {
  const targetDateAt3AM = getLocalNightDateAt3AM(dreamDate, userTimeZone);

  // 1. Ángulo de fase lunar con astronomy-engine
  const phaseAngle = Astronomy.MoonPhase(targetDateAt3AM);
  const phase = getMoonPhaseDetails(phaseAngle);

  // 2. Vector geocéntrico y coordenadas eclípticas tropicales verdaderas
  const moonGeoVector = Astronomy.GeoVector('Moon', targetDateAt3AM, true);
  const ecliptic = Astronomy.Ecliptic(moonGeoVector);
  const zodiac = getTropicalZodiacSign(ecliptic.elon);

  return {
    phaseName: phase.name,
    phaseEmoji: phase.emoji,
    zodiacSign: zodiac.name,
    zodiacSymbol: zodiac.symbol,
    calculationDate: targetDateAt3AM
  };
}

export default {
  calculateMoonForDate,
  getLocalNightDateAt3AM,
  getMoonPhaseDetails,
  getTropicalZodiacSign,
  ZODIAC_SIGNS
};
