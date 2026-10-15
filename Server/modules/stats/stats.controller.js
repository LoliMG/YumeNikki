import * as statsDal from './stats.dal.js';
import { calculateMoonForDate } from '../../utils/moonUtils.js';

export const getGeneralStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const [tagsStats, evolution, streak, crosses, frequentWords, frequentSymbols, hasGlossary, menstrualStats, hourlyStats] = await Promise.all([
      statsDal.getDreamsByTagStats(req.user_id, startDate, endDate),
      statsDal.getMonthlyEvolution(req.user_id, startDate, endDate),
      statsDal.getRecordingStreak(req.user_id),
      statsDal.getTagMoonCrossStats(req.user_id, startDate, endDate),
      statsDal.getFrequentWords(req.user_id, startDate, endDate, 10),
      statsDal.getFrequentSymbols(req.user_id, startDate, endDate, 10),
      statsDal.hasGlossarySymbols(req.user_id),
      statsDal.getMenstrualStats(req.user_id, startDate, endDate),
      statsDal.getHourlyDistribution(req.user_id, startDate, endDate)
    ]);

    return res.json({
      tagsStats,
      evolution,
      streak,
      crosses,
      hasGlossarySymbols: Boolean(hasGlossary),
      frequentSymbols,
      frequentWords,
      menstrualStats,
      hourlyStats
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthSummary = async (req, res, next) => {
  try {
    const { month } = req.query; // 'YYYY-MM'
    let targetMonth = month;
    if (!targetMonth) {
      const now = new Date();
      targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const summary = await statsDal.getMonthSummary(req.user_id, targetMonth);
    return res.json({ summary });
  } catch (error) {
    next(error);
  }
};

export const getMoonData = async (req, res, next) => {
  try {
    const { date, month, timezone = 'Europe/Madrid' } = req.query;

    if (date) {
      const moon = calculateMoonForDate(date, timezone);
      return res.json({ date, moon });
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, m, 0).getDate();
      const moons = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        moons[dateStr] = calculateMoonForDate(dateStr, timezone);
      }
      return res.json({ month, moons });
    }

    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now);
    const moon = calculateMoonForDate(todayStr, timezone);
    return res.json({ date: todayStr, moon });
  } catch (error) {
    next(error);
  }
};

export const getWordFrequency = async (req, res, next) => {
  try {
    const { word, startDate, endDate } = req.query;
    const result = await statsDal.getWordFrequency(req.user_id, word, startDate, endDate);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSymbolFrequency = async (req, res, next) => {
  try {
    const { symbol, word, startDate, endDate } = req.query;
    const target = symbol || word;
    const result = await statsDal.getSymbolFrequency(req.user_id, target, startDate, endDate);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};


