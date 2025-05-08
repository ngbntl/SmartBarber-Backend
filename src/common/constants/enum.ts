export enum RoleType {
  USER = 'system_user',
  STYLIST = 'system_stylist',
  ADMIN = 'system_admin',
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
}

export const timeZoneObj = {
  manualTimezone: '',
  automaticTimezone: '',
  useAutomaticTimezone: 'true',
};

export const notifyPropsObj = {
  push: 'mention',
  email: 'true',
  channel: 'true',
  desktop: 'mention',
  comments: 'never',
  first_name: 'false',
  push_status: 'away',
  mention_keys: '',
  push_threads: 'all',
  desktop_sound: 'true',
  email_threads: 'all',
  desktop_threads: 'all',
};
