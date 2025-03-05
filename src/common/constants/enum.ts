export enum Role {
  User = 'system_user',
  Admin = 'system_admin',
  Barber = 'system_barber',
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
