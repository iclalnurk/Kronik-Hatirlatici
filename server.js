const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const accountSid = "ACbcbb047d6f96bee6c3596b3db076c150";
const authToken = '339ceb55a5a6fc293d3a2bbc6ff64773'; // Twilio paneldeki token
const client = twilio(accountSid, authToken);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/send-whatsapp", async (req, res) => {
  const { phone, text } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ error: "phone ve text zorunlu" });
  }

  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:" + phone, // Örn: +90553xxxxxxx
      body: text,
    });

    console.log("WhatsApp mesajı gönderildi:", message.sid);
    return res.json({ success: true, sid: message.sid });
  } catch (err) {
    console.error("Twilio Hatası:", err);
    return res.status(500).json({
      error: err.message,
      code: err.code,
      moreInfo: err.moreInfo,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
