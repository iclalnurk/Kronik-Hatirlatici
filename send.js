const accountSid = 'ACbcbb047d6f96bee6c3596b3db076c150';
const authToken = '339ceb55a5a6fc293d3a2bbc6ff64773';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    from: 'whatsapp:+14155238886',  // Twilio sandbox numarası
    to: 'whatsapp:+905530795838',   // Senin numaran (join ile bağladığın)
    body: 'Test mesajı: sistem çalışıyor!'
  })
  .then(message => console.log(message.sid))
  .catch(err => console.error(err));
