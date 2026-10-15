import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from 'astronomy-engine';
import {
  calculateMoonForDate,
  getLocalNightDateAt3AM,
  getMoonPhaseDetails,
  getTropicalZodiacSign,
  ZODIAC_SIGNS
} from '../utils/moonUtils.js';

describe('Cálculo Lunar y Zodíaco Tropical (astronomy-engine)', () => {
  test('Respeta el horario de verano e invierno en Europe/Madrid a las 03:00 local', () => {
    // Verano en España (CEST = UTC+2): 03:00 hora local debe ser 01:00:00Z
    const summerDate = getLocalNightDateAt3AM('2026-07-15', 'Europe/Madrid');
    assert.equal(summerDate.getUTCHours(), 1);
    assert.equal(summerDate.getUTCMinutes(), 0);

    // Invierno en España (CET = UTC+1): 03:00 hora local debe ser 02:00:00Z
    const winterDate = getLocalNightDateAt3AM('2026-01-15', 'Europe/Madrid');
    assert.equal(winterDate.getUTCHours(), 2);
    assert.equal(winterDate.getUTCMinutes(), 0);
  });

  test('Determina fases lunares en puntos cardinales generados dinámicamente', () => {
    // Generar casos dinámicamente con Astronomy.SearchMoonPhase sin fechas fijas
    const searchStart = new Date('2026-01-01T00:00:00Z');

    // 1. Luna Nueva exacta (0°)
    const exactNewMoon = Astronomy.SearchMoonPhase(0, searchStart, 40);
    assert.ok(exactNewMoon);
    const newMoonAngle = Astronomy.MoonPhase(exactNewMoon.date);
    const newMoonPhase = getMoonPhaseDetails(newMoonAngle);
    assert.equal(newMoonPhase.name, 'Luna nueva');
    assert.equal(newMoonPhase.emoji, '🌑');

    // 2. Cuarto Creciente exacto (90°)
    const exactFirstQuarter = Astronomy.SearchMoonPhase(90, searchStart, 40);
    assert.ok(exactFirstQuarter);
    const firstQuarterAngle = Astronomy.MoonPhase(exactFirstQuarter.date);
    const firstQuarterPhase = getMoonPhaseDetails(firstQuarterAngle);
    assert.equal(firstQuarterPhase.name, 'Cuarto creciente');
    assert.equal(firstQuarterPhase.emoji, '🌓');

    // 3. Luna Llena exacta (180°)
    const exactFullMoon = Astronomy.SearchMoonPhase(180, searchStart, 40);
    assert.ok(exactFullMoon);
    const fullMoonAngle = Astronomy.MoonPhase(exactFullMoon.date);
    const fullMoonPhase = getMoonPhaseDetails(fullMoonAngle);
    assert.equal(fullMoonPhase.name, 'Luna llena');
    assert.equal(fullMoonPhase.emoji, '🌕');

    // 4. Cuarto Menguante exacto (270°)
    const exactThirdQuarter = Astronomy.SearchMoonPhase(270, searchStart, 40);
    assert.ok(exactThirdQuarter);
    const thirdQuarterAngle = Astronomy.MoonPhase(exactThirdQuarter.date);
    const thirdQuarterPhase = getMoonPhaseDetails(thirdQuarterAngle);
    assert.equal(thirdQuarterPhase.name, 'Cuarto menguante');
    assert.equal(thirdQuarterPhase.emoji, '🌗');
  });

  test('Fases intermedias funcionan correctamente fuera de las ventanas cardinales', () => {
    assert.equal(getMoonPhaseDetails(45).name, 'Luna creciente');
    assert.equal(getMoonPhaseDetails(45).emoji, '🌒');

    assert.equal(getMoonPhaseDetails(135).name, 'Gibosa creciente');
    assert.equal(getMoonPhaseDetails(135).emoji, '🌔');

    assert.equal(getMoonPhaseDetails(225).name, 'Gibosa menguante');
    assert.equal(getMoonPhaseDetails(225).emoji, '🌖');

    assert.equal(getMoonPhaseDetails(315).name, 'Luna menguante');
    assert.equal(getMoonPhaseDetails(315).emoji, '🌘');
  });

  test('El zodíaco es tropical y abarca los 12 signos con selector de variación \\uFE0E', () => {
    assert.equal(ZODIAC_SIGNS.length, 12);

    const testAngles = [
      { lon: 15, sign: 'Aries', symbol: '♈\uFE0E' },
      { lon: 45, sign: 'Tauro', symbol: '♉\uFE0E' },
      { lon: 75, sign: 'Géminis', symbol: '♊\uFE0E' },
      { lon: 105, sign: 'Cáncer', symbol: '♋\uFE0E' },
      { lon: 135, sign: 'Leo', symbol: '♌\uFE0E' },
      { lon: 165, sign: 'Virgo', symbol: '♍\uFE0E' },
      { lon: 195, sign: 'Libra', symbol: '♎\uFE0E' },
      { lon: 225, sign: 'Escorpio', symbol: '♏\uFE0E' },
      { lon: 255, sign: 'Sagitario', symbol: '♐\uFE0E' },
      { lon: 285, sign: 'Capricornio', symbol: '♑\uFE0E' },
      { lon: 315, sign: 'Acuario', symbol: '♒\uFE0E' },
      { lon: 345, sign: 'Piscis', symbol: '♓\uFE0E' }
    ];

    for (const testCase of testAngles) {
      const result = getTropicalZodiacSign(testCase.lon);
      assert.equal(result.name, testCase.sign);
      assert.equal(result.symbol, testCase.symbol);
      assert.ok(result.symbol.includes('\uFE0E'), 'El símbolo debe incluir el selector de texto');
    }
  });

  test('calculateMoonForDate devuelve el objeto completo para una fecha dada', () => {
    const res = calculateMoonForDate('2026-10-13', 'Europe/Madrid');
    assert.ok(res.phaseName);
    assert.ok(res.phaseEmoji);
    assert.ok(res.zodiacSign);
    assert.ok(res.zodiacSymbol);
    assert.ok(res.calculationDate);
  });
});
