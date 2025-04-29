export default () => ({
  app: {
    port: process.env.PORT || '3000',
    server_url: process.env.SERVER_URL || '',
    client_url: process.env.CLIENT_URL || '',
    salt_round: process.env.SALT_ROUND || '',
    domain_web: process.env.APP_DOMAIN_WEB || 'localhost',
    encode_key: process.env.ENCODE_KEY || '',
  },
  email: {
    server: process.env.MAIL_SERVER || '',
    password: process.env.MAIL_PASSWORD || '',
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    sender: process.env.MAIL_SENDER || '',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
});
