const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const accountSid = "ACbcbb047d6f96bee6c3596b3db076c150";
const authToken = "339ceb55a5a6fc293d3a2bbc6ff64773";
const client = twilio(accountSid, authToken);

exports.sendWhatsApp = functions.firestore
  .document("mesajlar/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const phone = data.phone;     // alıcı telefon numarası
    const message = data.text;    // gönderilecek mesaj

    if (!phone || !message) return null;

    try {
      const result = await client.messages.create({
        body: message,
        from: "whatsapp:+14155238886",  // Twilio WhatsApp numarası
        to: "whatsapp:" + phone,
      });

      console.log("WhatsApp mesajı gönderildi:", result.sid);
    } catch (error) {
      console.error("Hata:", error);
    }

    return null;
  });
