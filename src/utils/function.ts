import * as moment from 'moment-timezone';

export const generateUUID = () => {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateTimestamp = () => {
  const now = new Date();
  const timestamp = now.getTime().toString(36);
  return timestamp;
};

export const generateUserId = () => {
  const uuid = generateUUID();
  const timestamp = generateTimestamp();
  const uuidWithTimestamp = uuid + timestamp;
  return uuidWithTimestamp.substring(0, 26);
};

export const formattedDate = (date: any) => {
  const dateTime = moment.tz(date, 'UTC').tz('Asia/Ho_Chi_Minh');
  const formattedDate = dateTime.format('YYYY-MM-DD HH:mm:ss');
  return formattedDate;
};

export const generateCustomString = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};

export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getDayOfWeek = (date: Date): string => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
