import { executeQuery } from '../../config/db.js';

export const SPANISH_STOPWORDS = new Set([
  'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'aquel', 'aquella',
  'aquellas', 'aquellos', 'aqui', 'aquí', 'arriba', 'asi', 'así', 'atras', 'atrás',
  'aun', 'aún', 'bajo', 'bastante', 'bien', 'cabe', 'cada', 'casi', 'cerca',
  'cierto', 'como', 'cómo', 'con', 'conmigo', 'conseguir', 'consigo', 'consigue',
  'consiguen', 'consigues', 'contra', 'cual', 'cuál', 'cuales', 'cuáles', 'cualquier',
  'cuando', 'cuándo', 'cuanto', 'cuánto', 'cuanta', 'cuánta', 'cuantas', 'cuántas',
  'cuantos', 'cuántos', 'de', 'dejar', 'del', 'demas', 'demás', 'demasiada',
  'demasiadas', 'demasiado', 'demasiados', 'dentro', 'desde', 'donde', 'dónde',
  'dos', 'el', 'él', 'ella', 'ellas', 'ello', 'ellos', 'emplear', 'emplean',
  'empleas', 'empleo', 'en', 'encima', 'entonces', 'entre', 'era', 'erais',
  'eramos', 'éramos', 'eran', 'eras', 'eres', 'es', 'esa', 'esas', 'ese',
  'eso', 'esos', 'esta', 'está', 'estaba', 'estabais', 'estabamos', 'estábamos',
  'estaban', 'estabas', 'estad', 'estada', 'estadas', 'estado', 'estados',
  'estais', 'estais', 'estamos', 'estan', 'están', 'estar', 'estará', 'estas',
  'éstas', 'este', 'éste', 'estemos', 'esto', 'estos', 'éstos', 'estoy',
  'estuve', 'estuviera', 'estuvieran', 'estuvieras', 'estuvieron', 'estuviese',
  'estuvieseis', 'estuviesen', 'estuvieses', 'estuvimos', 'estuviste', 'estuvisteis',
  'estuvo', 'fin', 'fue', 'fuerais', 'fueran', 'fueras', 'fueron', 'fuese',
  'fueseis', 'fuesen', 'fueses', 'fui', 'fuimos', 'fuiste', 'fuisteis', 'ha',
  'habeis', 'habéis', 'haber', 'habia', 'había', 'habiais', 'habíais', 'habiamos',
  'habíamos', 'habian', 'habían', 'habias', 'habías', 'habida', 'habidas',
  'habido', 'habidos', 'habiendo', 'habla', 'hablan', 'hablar', 'hablas', 'hago',
  'han', 'has', 'hasta', 'hay', 'haya', 'hayais', 'hayáis', 'hayan', 'hayas',
  'hayamos', 'he', 'hecho', 'hemos', 'hube', 'hubiera', 'hubierais', 'hubieran',
  'hubieras', 'hubieron', 'hubiese', 'hubieseis', 'hubiesen', 'hubieses', 'hubimos',
  'hubiste', 'hubisteis', 'hubo', 'la', 'las', 'le', 'les', 'lo', 'los', 'mas',
  'más', 'me', 'menos', 'mi', 'mí', 'mia', 'mía', 'mias', 'mías', 'mientras',
  'mio', 'mío', 'mios', 'míos', 'mis', 'misma', 'mismas', 'mismo', 'mismos',
  'modo', 'mucha', 'muchas', 'mucho', 'muchos', 'muy', 'nada', 'ni', 'ningun',
  'ningún', 'ninguna', 'ningunas', 'ninguno', 'ningunos', 'no', 'nos', 'nosotras',
  'nosotros', 'nuestra', 'nuestras', 'nuestro', 'nuestros', 'nunca', 'o', 'os',
  'otra', 'otras', 'otro', 'otros', 'para', 'parecer', 'pero', 'poca', 'pocas',
  'poco', 'pocos', 'podeis', 'podéis', 'podemos', 'poder', 'podria', 'podría',
  'podriais', 'podríais', 'podriamos', 'podríamos', 'podrian', 'podrían', 'podrias',
  'podrías', 'por', 'por qué', 'porque', 'primero', 'puede', 'pueden', 'puedo',
  'pues', 'que', 'qué', 'quereis', 'queréis', 'queremos', 'querer', 'quiere',
  'quieren', 'quiero', 'quien', 'quién', 'quienes', 'quiénes', 'quiza', 'quizá',
  'quizas', 'quizás', 'sabe', 'sabeis', 'sabéis', 'sabemos', 'saben', 'saber',
  'sabes', 'se', 'sé', 'segun', 'según', 'ser', 'sera', 'será', 'seran', 'serán',
  'si', 'sí', 'sido', 'siempre', 'siendo', 'sin', 'sino', 'sois', 'sobre', 'sois',
  'solamente', 'solo', 'sólo', 'somos', 'son', 'soy', 'su', 'sus', 'suya', 'suyas',
  'suyo', 'suyos', 'tal', 'tales', 'tambien', 'también', 'tampoco', 'tan', 'tanta',
  'tantas', 'tanto', 'tantos', 'te', 'teneis', 'tenéis', 'tenemos', 'tener',
  'tenga', 'tengais', 'tengáis', 'tengan', 'tengas', 'tengo', 'tenia', 'tenía',
  'teniais', 'teníais', 'teniamos', 'teníamos', 'tenian', 'tenían', 'tenias',
  'tenías', 'tenida', 'tenidas', 'tenido', 'tenidos', 'teniendo', 'ti', 'tiempo',
  'tiene', 'tienen', 'tienes', 'toda', 'todas', 'todavia', 'todavía', 'todo',
  'todos', 'total', 'tras', 'tu', 'tú', 'tus', 'tuve', 'tuviera', 'tuvierais',
  'tuvieran', 'tuvieras', 'tuvieron', 'tuviese', 'tuvieseis', 'tuviesen', 'tuvieses',
  'tuvimos', 'tuviste', 'tuvisteis', 'tuvo', 'tuya', 'tuyas', 'tuyo', 'tuyos',
  'un', 'una', 'unas', 'uno', 'unos', 'usa', 'usan', 'usar', 'usas', 'uso',
  'va', 'vais', 'vamos', 'van', 'varias', 'varios', 'vaya', 'vayais', 'vayáis',
  'vayan', 'vayas', 'veces', 'ver', 'vez', 'vosotras', 'vosotros', 'voy', 'vuestra',
  'vuestras', 'vuestro', 'vuestros', 'y', 'ya', 'yo'
]);

export const getDreamsByTagStats = async (userId, startDate, endDate) => {
  const conditions = ['d.user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`d.dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`d.dream_date <= $${params.length}`);
  }

  const query = `
    SELECT 
      COALESCE(t.name, 'Sin etiqueta') AS tag_name,
      COALESCE(t.initials, '—') AS tag_initials,
      COALESCE(t.color, '#64748b') AS tag_color,
      t.id AS tag_id,
      COUNT(d.id)::int AS count
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY t.id, t.name, t.initials, t.color
    ORDER BY count DESC;
  `;
  return await executeQuery(query, params);
};

export const getMonthlyEvolution = async (userId, startDate, endDate) => {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`dream_date <= $${params.length}`);
  }

  const query = `
    SELECT 
      TO_CHAR(dream_date, 'YYYY-MM') AS month,
      COUNT(id)::int AS count
    FROM dreams
    WHERE ${conditions.join(' AND ')}
    GROUP BY TO_CHAR(dream_date, 'YYYY-MM')
    ORDER BY month ASC;
  `;
  return await executeQuery(query, params);
};

export const getRecordingStreak = async (userId) => {
  // Racha de días consecutivos registrando sueños
  const query = `
    SELECT DISTINCT dream_date
    FROM dreams
    WHERE user_id = $1
    ORDER BY dream_date DESC;
  `;
  const rows = await executeQuery(query, [userId]);
  if (!rows || rows.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const dates = rows.map(r => new Date(r.dream_date));
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Comprobar si la racha actual está viva (hoy o ayer)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let prevDate = null;

  for (let i = 0; i < dates.length; i++) {
    const curDate = new Date(dates[i]);
    curDate.setHours(0, 0, 0, 0);

    if (i === 0) {
      const diffFromToday = Math.round((today - curDate) / (1000 * 60 * 60 * 24));
      if (diffFromToday <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      } else {
        currentStreak = 0;
        tempStreak = 1;
      }
    } else {
      const diff = Math.round((prevDate - curDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
        if (currentStreak > 0 && i === currentStreak) {
          currentStreak++;
        }
      } else {
        tempStreak = 1;
      }
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    prevDate = curDate;
  }

  if (currentStreak > maxStreak) maxStreak = currentStreak;

  return { currentStreak, maxStreak };
};

export const getTagMoonCrossStats = async (userId, startDate, endDate) => {
  const conditions = ['d.user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`d.dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`d.dream_date <= $${params.length}`);
  }

  const queryMoon = `
    SELECT 
      COALESCE(t.name, 'Sin etiqueta') AS tag_name,
      COALESCE(t.color, '#64748b') AS tag_color,
      d.moon_phase_name,
      d.moon_phase_emoji,
      COUNT(d.id)::int AS count
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY t.name, t.color, d.moon_phase_name, d.moon_phase_emoji
    ORDER BY count DESC;
  `;

  const queryZodiac = `
    SELECT 
      COALESCE(t.name, 'Sin etiqueta') AS tag_name,
      COALESCE(t.color, '#64748b') AS tag_color,
      d.moon_zodiac_sign,
      d.moon_zodiac_symbol,
      COUNT(d.id)::int AS count
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY t.name, t.color, d.moon_zodiac_sign, d.moon_zodiac_symbol
    ORDER BY count DESC;
  `;

  const [moonData, zodiacData] = await Promise.all([
    executeQuery(queryMoon, params),
    executeQuery(queryZodiac, params)
  ]);

  return { moonCross: moonData, zodiacCross: zodiacData };
};

export const hasGlossarySymbols = async (userId) => {
  try {
    const query = `
      SELECT 1 FROM symbol_glossary WHERE user_id = $1 LIMIT 1;
    `;
    const rows = await executeQuery(query, [userId]);
    return rows.length > 0;
  } catch (_e) {
    return false;
  }
};

export const getFrequentSymbols = async (userId, startDate, endDate, limit = 10) => {
  try {
    const symbols = await executeQuery(
      'SELECT id, symbol_name, archetype FROM symbol_glossary WHERE user_id = $1 ORDER BY symbol_name ASC',
      [userId]
    );

    if (!symbols || symbols.length === 0) {
      return [];
    }

    const conditions = ['user_id = $1'];
    const params = [userId];

    if (startDate) {
      params.push(startDate);
      conditions.push(`dream_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`dream_date <= $${params.length}`);
    }

    const dreams = await executeQuery(
      `SELECT id, title, content, symbolisms FROM dreams WHERE ${conditions.join(' AND ')}`,
      params
    );

    const results = symbols.map(sym => {
      const rawName = (sym.symbol_name || '').trim();
      if (!rawName) return null;
      const escaped = rawName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![a-záéíóúüñ])${escaped}(?![a-záéíóúüñ])`, 'gi');

      let totalCount = 0;
      let dreamCount = 0;

      for (const d of dreams) {
        const text = `${d.title || ''} ${d.content || ''} ${d.symbolisms || ''}`;
        const matches = text.match(regex);
        if (matches && matches.length > 0) {
          totalCount += matches.length;
          dreamCount++;
        }
      }

      return {
        symbol: rawName,
        archetype: sym.archetype || null,
        count: totalCount,
        dreamCount
      };
    }).filter(Boolean);

    return results
      .sort((a, b) => b.count - a.count || b.dreamCount - a.dreamCount || a.symbol.localeCompare(b.symbol))
      .slice(0, limit);
  } catch (_e) {
    return [];
  }
};

export const getFrequentWords = async (userId, startDate, endDate, limit = 40) => {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`dream_date <= $${params.length}`);
  }

  try {
    const stopwordsArray = Array.from(SPANISH_STOPWORDS);
    params.push(stopwordsArray);
    const stopwordsParam = `$${params.length}`;
    params.push(limit);
    const limitParam = `$${params.length}`;

    const sqlAggQuery = `
      SELECT word, COUNT(*)::int AS count
      FROM (
        SELECT lower(unnest(string_to_array(regexp_replace(COALESCE(title,'') || ' ' || COALESCE(content,'') || ' ' || COALESCE(symbolisms,''), '[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+', ' ', 'g'), ' '))) AS word
        FROM dreams
        WHERE ${conditions.join(' AND ')}
      ) t
      WHERE length(word) >= 3 AND NOT (word = ANY(${stopwordsParam}::text[]))
      GROUP BY word
      ORDER BY count DESC
      LIMIT ${limitParam};
    `;

    return await executeQuery(sqlAggQuery, params);
  } catch (_error) {
    // Fallback seguro en memoria si la función unnest / regex no estuviera soportada en el mock de pruebas
    const fallbackParams = [userId];
    const fallbackConditions = ['user_id = $1'];
    if (startDate) {
      fallbackParams.push(startDate);
      fallbackConditions.push(`dream_date >= $${fallbackParams.length}`);
    }
    if (endDate) {
      fallbackParams.push(endDate);
      fallbackConditions.push(`dream_date <= $${fallbackParams.length}`);
    }
    const rows = await executeQuery(`SELECT title, content, symbolisms FROM dreams WHERE ${fallbackConditions.join(' AND ')}`, fallbackParams);
    const wordCounts = {};
    for (const row of rows) {
      const combinedText = `${row.title || ''} ${row.content || ''} ${row.symbolisms || ''}`.toLowerCase();
      const tokens = combinedText.match(/[a-záéíóúüñ]{3,}/g) || [];
      for (const token of tokens) {
        if (!SPANISH_STOPWORDS.has(token)) {
          wordCounts[token] = (wordCounts[token] || 0) + 1;
        }
      }
    }
    return Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};

export const getWordFrequency = async (userId, targetWord, startDate, endDate) => {
  if (!targetWord || !targetWord.trim()) {
    return { word: '', count: 0, dreamCount: 0 };
  }

  const cleanWord = targetWord.trim().toLowerCase();
  const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![a-záéíóúüñ])${escaped}(?![a-záéíóúüñ])`, 'gi');

  const conditions = ['user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`dream_date <= $${params.length}`);
  }

  const rows = await executeQuery(
    `SELECT id, title, content, symbolisms, characters, places, notes
     FROM dreams
     WHERE ${conditions.join(' AND ')}`,
    params
  );

  let totalOccurrences = 0;
  let dreamCount = 0;

  for (const row of rows) {
    const text = `${row.title || ''} ${row.content || ''} ${row.symbolisms || ''} ${row.characters || ''} ${row.places || ''} ${row.notes || ''}`;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      totalOccurrences += matches.length;
      dreamCount++;
    }
  }

  return {
    word: cleanWord,
    count: totalOccurrences,
    dreamCount
  };
};

export const getSymbolFrequency = async (userId, targetSymbol, startDate, endDate) => {
  if (!targetSymbol || !targetSymbol.trim()) {
    return { symbol: '', word: '', count: 0, dreamCount: 0 };
  }

  const cleanSymbol = targetSymbol.trim();
  const escaped = cleanSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![a-záéíóúüñ])${escaped}(?![a-záéíóúüñ])`, 'gi');

  const conditions = ['user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`dream_date <= $${params.length}`);
  }

  const rows = await executeQuery(
    `SELECT id, title, content, symbolisms, characters, places, notes
     FROM dreams
     WHERE ${conditions.join(' AND ')}`,
    params
  );

  let totalOccurrences = 0;
  let dreamCount = 0;

  for (const row of rows) {
    const text = `${row.title || ''} ${row.content || ''} ${row.symbolisms || ''} ${row.characters || ''} ${row.places || ''} ${row.notes || ''}`;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      totalOccurrences += matches.length;
      dreamCount++;
    }
  }

  return {
    symbol: cleanSymbol,
    word: cleanSymbol,
    count: totalOccurrences,
    dreamCount
  };
};

export const getMonthSummary = async (userId, yearMonth) => {
  // yearMonth en formato 'YYYY-MM'
  const queryCount = `
    SELECT COUNT(*)::int AS dream_count
    FROM dreams
    WHERE user_id = $1 AND TO_CHAR(dream_date, 'YYYY-MM') = $2;
  `;
  const countRes = await executeQuery(queryCount, [userId, yearMonth]);

  const queryTopTag = `
    SELECT 
      t.id, t.name, t.initials, t.color,
      COUNT(d.id)::int AS count
    FROM dreams d
    JOIN tags t ON d.tag_id = t.id
    WHERE d.user_id = $1 AND TO_CHAR(d.dream_date, 'YYYY-MM') = $2
    GROUP BY t.id, t.name, t.initials, t.color
    ORDER BY count DESC
    LIMIT 1;
  `;
  const topTagRes = await executeQuery(queryTopTag, [userId, yearMonth]);

  const streak = await getRecordingStreak(userId);

  return {
    month: yearMonth,
    dreamCount: countRes[0]?.dream_count || 0,
    topTag: topTagRes[0] || null,
    streak: streak.currentStreak
  };
};

export const getMenstrualStats = async (userId, startDate, endDate) => {
  const userRes = await executeQuery('SELECT track_cycle, gender FROM users WHERE id = $1', [userId]);
  if (!userRes[0] || !userRes[0].track_cycle) {
    return { tracked: false };
  }

  const conditions = ['d.user_id = $1'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`d.dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`d.dream_date <= $${params.length}`);
  }

  const query = `
    WITH bleeding_dates AS (
      SELECT note_date AS d_date
      FROM day_notes
      WHERE user_id = $1 AND is_bleeding = true
      UNION
      SELECT generate_series(start_date::timestamp, COALESCE(end_date, start_date)::timestamp, '1 day'::interval)::date AS d_date
      FROM menstrual_periods
      WHERE user_id = $1
    )
    SELECT 
      d.id,
      d.dream_date,
      d.moon_phase_name,
      d.moon_phase_emoji,
      t.id AS tag_id,
      COALESCE(t.name, 'Sin etiqueta') AS tag_name,
      COALESCE(t.initials, '—') AS tag_initials,
      COALESCE(t.color, '#64748b') AS tag_color,
      d.title,
      d.content,
      d.symbolisms,
      (b.d_date IS NOT NULL) AS is_menstrual
    FROM dreams d
    LEFT JOIN tags t ON d.tag_id = t.id
    LEFT JOIN bleeding_dates b ON d.dream_date = b.d_date
    WHERE ${conditions.join(' AND ')}
    ORDER BY d.dream_date DESC;
  `;

  const rows = await executeQuery(query, params);

  const menstrualDreams = rows.filter(r => r.is_menstrual);
  const nonMenstrualDreams = rows.filter(r => !r.is_menstrual);

  const aggregateTags = (dreamList) => {
    const total = dreamList.length;
    const map = {};
    for (const d of dreamList) {
      const key = d.tag_name;
      if (!map[key]) {
        map[key] = {
          tag_name: d.tag_name,
          tag_initials: d.tag_initials,
          tag_color: d.tag_color,
          count: 0
        };
      }
      map[key].count++;
    }
    return Object.values(map)
      .map(t => ({
        ...t,
        percentage: total > 0 ? Math.round((t.count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const moonPhaseMap = {};
  for (const d of menstrualDreams) {
    if (d.moon_phase_name) {
      const key = d.moon_phase_name;
      if (!moonPhaseMap[key]) {
        moonPhaseMap[key] = {
          phase: d.moon_phase_name,
          emoji: d.moon_phase_emoji,
          count: 0
        };
      }
      moonPhaseMap[key].count++;
    }
  }
  const moonSynchrony = Object.values(moonPhaseMap).sort((a, b) => b.count - a.count);

  const wordsMap = {};
  for (const d of menstrualDreams) {
    const combined = `${d.title || ''} ${d.content || ''} ${d.symbolisms || ''}`.toLowerCase();
    const tokens = combined.match(/[a-záéíóúüñ]{3,}/g) || [];
    for (const t of tokens) {
      if (!SPANISH_STOPWORDS.has(t)) {
        wordsMap[t] = (wordsMap[t] || 0) + 1;
      }
    }
  }
  const frequentWords = Object.entries(wordsMap)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    tracked: true,
    totalDreams: rows.length,
    menstrualDreamsCount: menstrualDreams.length,
    nonMenstrualDreamsCount: nonMenstrualDreams.length,
    menstrualRatio: rows.length > 0 ? Math.round((menstrualDreams.length / rows.length) * 100) : 0,
    tagsDuringMenstruation: aggregateTags(menstrualDreams),
    tagsOutsideMenstruation: aggregateTags(nonMenstrualDreams),
    moonSynchrony,
    frequentWords
  };
};

export const getHourlyDistribution = async (userId, startDate, endDate) => {
  const conditions = ['user_id = $1', 'dream_time IS NOT NULL'];
  const params = [userId];

  if (startDate) {
    params.push(startDate);
    conditions.push(`dream_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`dream_date <= $${params.length}`);
  }

  const query = `
    SELECT 
      SUBSTRING(dream_time::text FROM 1 FOR 2) AS hour,
      COUNT(*)::int AS count
    FROM dreams
    WHERE ${conditions.join(' AND ')}
    GROUP BY SUBSTRING(dream_time::text FROM 1 FOR 2)
    ORDER BY hour ASC;
  `;
  return await executeQuery(query, params);
};
