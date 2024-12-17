export function getDelayTimes(level: number): number {
  if (level >= 1 && level <= 5) {
    return 15 * 1000; // 15 секунд
  } else if (level >= 6 && level <= 10) {
    return 1 * 60 * 1000; // 1 минута
  } else if (level >= 11 && level <= 15) {
    return 5 * 60 * 1000; // 5 минут
  } else if (level >= 16 && level <= 20) {
    return 30 * 60 * 1000; // 30 минут
  } else if (level >= 21 && level <= 25) {
    return 1 * 60 * 60 * 1000; // 1 час
  } else if (level >= 26 && level <= 30) {
    return 2 * 60 * 60 * 1000; // 2 часа
  }
  return 0; // Если уровень не соответствует ни одному из диапазонов
}
