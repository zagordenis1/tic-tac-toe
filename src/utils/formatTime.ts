/**
 * Форматує тривалість у мілісекундах у компактний рядок MM:SS.
 * Використовується таймером і списком матчів для відображення тривалості гри.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Форматує дату для списку матчів. Використовуємо короткий формат
 * `YYYY-MM-DD HH:MM`, який однозначно сортується як рядок і легко
 * читається без локалізації.
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
