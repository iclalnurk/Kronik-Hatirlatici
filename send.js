require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    from: 'whatsapp:+14155238886',  // Twilio sandbox numarası
    to: 'whatsapp:+905530795838',   // Senin numaran (join ile bağladığın)
    body: 'Test mesajı: sistem çalışıyor!'
  })
  .then(message => console.log(message.sid))
  .catch(err => console.error(err));
