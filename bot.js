require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const cron = require("node-cron");
const http = require("http");

const bot = new Telegraf(process.env.BOT_TOKEN);
const channelId = process.env.CHANNEL_ID;

// Générateur de signal
function generateSignal() {
  const generateLine = () => {
    const positions = ['🟩', '🟩', '🟩', '🟩', '🍎'];
    const shuffled = positions.sort(() => 0.5 - Math.random());
    return shuffled.join(' ');
  };

  return [
    `2.41:${generateLine()}`,
    `1.93:${generateLine()}`,
    `1.54:${generateLine()}`,
    `1.23:${generateLine()}`
  ].join('\n');
}

// Contenu du message
function buildMessage() {
  return `🔔 CONFIRMED ENTRY!
🍎 Apple : 4
🔐 Attempts: 5
⏰ Validity: 5 minutes

${generateSignal()}

🚨 FONCTIONNE UNIQUEMENT SUR 1XBET ET LINEBET AVEC LE CODE PROMO Free221 ✅️ !

<a href="https://bit.ly/3NJ4vy0">SING UP</a>
<a href="https://t.me/c/1923341484/15456">HOW TO PLAY</a>`;
}

// Envoie un signal dans le canal
async function sendSignal(ctx = null) {
  const message = buildMessage();
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url("S'inscrire", "https://bit.ly/3NJ4vy0"),
      Markup.button.url("Comment jouer", "https://t.me/c/1923341484/1102")
    ]
  ]);

  try {
    // Vérifier si channelId est défini
    if (!channelId) {
      console.error("❌ CHANNEL_ID n'est pas défini dans les variables d'environnement");
      if (ctx) ctx.reply("❌ Erreur: CHANNEL_ID non configuré");
      return;
    }

    await bot.telegram.sendMessage(channelId, message, { parse_mode: "HTML", ...keyboard });
    console.log("✅ Signal envoyé avec succès au canal:", channelId);
    
    if (ctx) ctx.reply("✅ Signal envoyé !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du signal:", error.message);
    
    if (ctx) {
      ctx.reply(`❌ Erreur: ${error.message}`);
    }
  }
}

// Commande pour obtenir l'ID du chat
bot.command("chatid", (ctx) => {
  ctx.reply(`📝 Chat ID: \`${ctx.chat.id}\`\nType: ${ctx.chat.type}`, { parse_mode: "Markdown" });
});

// Commande manuelle
bot.command("send", async (ctx) => {
  if (ctx.message.from.id.toString() === "7910987557") {
    await sendSignal(ctx);
  } else {
    ctx.reply("⛔ Non autorisé");
  }
});

// Planning automatique
const times = ["0 9 * * *", "0 13 * * *", "0 17 * * *", "0 20 * * *", "0 22 * * *"];
times.forEach((t) => {
  cron.schedule(t, () => {
    sendSignal();
  });
});

// Validation au démarrage
if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN manquant dans les variables d'environnement");
  process.exit(1);
}

if (!process.env.CHANNEL_ID) {
  console.error("❌ CHANNEL_ID manquant dans les variables d'environnement");
  console.log("💡 Pour obtenir l'ID de votre canal, envoyez un message à votre bot et regardez les logs");
}

bot.launch();
console.log("🚀 Bot lancé...");
console.log("📝 Channel ID configuré:", channelId || "NON DÉFINI");

// --- Serveur HTTP pour le ping ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("I'm alive");
});
server.listen(8080, () => console.log("🌍 Server running on port 8080"));
