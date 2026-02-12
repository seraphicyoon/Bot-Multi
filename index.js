require("dotenv").config();
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/* ===============================
   SISTEMA DE CONTADOR (JSON)
================================ */

function loadJson(path) {
  try {
    if (fs.existsSync(path)) return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    console.log(`⚠️ No pude leer ${path}:`, e);
  }
  return {};
}

function saveJson(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(`⚠️ No pude guardar ${path}:`, e);
  }
}

function getPairKey(id1, id2) {
  return [id1, id2].sort().join("_");
}

function addCount(store, filePath, id1, id2) {
  const key = getPairKey(id1, id2);
  if (!store[key]) store[key] = 0;
  store[key]++;
  saveJson(filePath, store);
  return store[key];
}

const KISSES_FILE = "./kisses.json";
const HUGS_FILE = "./hugs.json";

let kissData = loadJson(KISSES_FILE);
let hugData = loadJson(HUGS_FILE);

/* ===============================
   GIFS
================================ */

const KISS_GIFS = {
  yuri: [
    "https://i.imgur.com/7vf0xuZ.gif",
    "https://i.imgur.com/8AUqDDZ.gif",
    "https://i.imgur.com/a8wvlp2.gif",
    "https://i.imgur.com/5FwrWiG.gif",
    "https://i.imgur.com/oJDGoDA.gif",
    "https://i.imgur.com/2EFQt3k.gif",
    "https://i.imgur.com/glyexpN.gif",
    "https://i.imgur.com/rIAevRo.gif",
    "https://i.imgur.com/uNtTSXO.gif",
    "https://i.imgur.com/qvntOTe.gif",
  ],
  yaoi: [
    "https://i.imgur.com/nkmoNDT.gif",
    "https://i.imgur.com/CKQevBV.gif",
    "https://i.imgur.com/09uQbM4.gif",
    "https://i.imgur.com/eJm3z7d.gif",
    "https://i.imgur.com/sxuRsDu.gif",
    "https://i.imgur.com/e6pcpUK.gif",
    "https://i.imgur.com/2UJubb8.gif",
  ],
};

// ✅ Pon aquí tus GIFs de abrazos (puedes cambiarlos por los tuyos)
const HUG_GIFS = {
  yuri: [
    "https://i.imgur.com/2fKQy3M.gif",
    "https://i.imgur.com/7xJb7Q4.gif",
  ],
  yaoi: [
    "https://i.imgur.com/Jy5d0xv.gif",
    "https://i.imgur.com/wKxq2y1.gif",
  ],
};

const REJECT_GIFS = ["https://i.imgur.com/vMlK7oJ.gif"];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ===============================
   SLASH COMMANDS
================================ */

const commands = [
  new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Besa a alguien 💋")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿A quién quieres besar?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices(
          { name: "Yuri", value: "yuri" },
          { name: "Yaoi", value: "yaoi" }
        )
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Abraza a alguien 🤗")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("¿A quién quieres abrazar?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices(
          { name: "Yuri", value: "yuri" },
          { name: "Yaoi", value: "yaoi" }
        )
        .setRequired(true)
    ),
].map((cmd) => cmd.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log("✅ Comandos /kiss y /hug registrados GLOBALMENTE");
}

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  await registerCommands();
});

/* ===============================
   INTERACCIONES
================================ */

client.on("interactionCreate", async (interaction) => {
  /* --- Slash Commands --- */
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;

    if (cmd !== "kiss" && cmd !== "hug") return;

    const usuario = interaction.options.getUser("usuario", true);
    const tipo = interaction.options.getString("tipo", true);

    if (usuario.bot || usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes hacer eso.",
        ephemeral: true,
      });
    }

    const isKiss = cmd === "kiss";
    const gifs = isKiss ? KISS_GIFS : HUG_GIFS;

    const pool = gifs[tipo] || [];
    if (!pool.length) {
      return interaction.reply({
        content: `⚠️ No tengo GIFs para **${cmd}** tipo **${tipo}** todavía.`,
        ephemeral: true,
      });
    }

    const gif = random(pool);
    const count = isKiss
      ? addCount(kissData, KISSES_FILE, interaction.user.id, usuario.id)
      : addCount(hugData, HUGS_FILE, interaction.user.id, usuario.id);

    const emoji = isKiss ? "💋" : "🤗";
    const verbo = isKiss ? "besa" : "abraza";
    const footer = isKiss ? "¿Corresponderás el beso?" : "¿Corresponderás el abrazo?";

    const embed = new EmbedBuilder()
      .setDescription(
        `${emoji} **${interaction.user.username}** ${verbo} a **${usuario.username}**\n\n` +
          `💞 Se han ${isKiss ? "besado" : "abrazado"} **${count}** veces.`
      )
      .setImage(gif)
      .setFooter({ text: footer });

    const backLabel = isKiss ? "💋 Besar de vuelta" : "🤗 Abrazar de vuelta";

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${cmd}_back_${interaction.user.id}_${usuario.id}_${tipo}`)
        .setLabel(backLabel)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`${cmd}_reject_${interaction.user.id}_${usuario.id}`)
        .setLabel("❌ Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      embeds: [embed],
      components: [botones],
    });
  }

  /* --- Botones --- */
  if (interaction.isButton()) {
    const parts = interaction.customId.split("_");
    // customId: kiss_back_<autorId>_<targetId>_<tipo>
    // customId: hug_back_<autorId>_<targetId>_<tipo>
    // customId: kiss_reject_<autorId>_<targetId>
    // customId: hug_reject_<autorId>_<targetId>

    const cmd = parts[0]; // kiss | hug
    const action = parts[1]; // back | reject
    const autorId = parts[2];
    const targetId = parts[3];
    const tipo = parts[4]; // solo existe en back

    if (cmd !== "kiss" && cmd !== "hug") return;

    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: "⚠️ Solo la persona mencionada puede responder.",
        ephemeral: true,
      });
    }

    const isKiss = cmd === "kiss";

    /* ✅ DEVOLVER */
    if (action === "back") {
      const gifs = isKiss ? KISS_GIFS : HUG_GIFS;
      const pool = gifs[tipo] || [];
      const gif = pool.length ? random(pool) : null;

      const count = isKiss
        ? addCount(kissData, KISSES_FILE, autorId, targetId)
        : addCount(hugData, HUGS_FILE, autorId, targetId);

      const embed = new EmbedBuilder()
        .setDescription(
          `${isKiss ? "💖" : "💞"} **${interaction.user.username}** devolvió ${
            isKiss ? "el beso" : "el abrazo"
          }!\n\n` + `Ahora se han ${isKiss ? "besado" : "abrazado"} **${count}** veces.`
        )
        .setImage(gif);

      return interaction.update({
        embeds: [embed],
        components: [],
      });
    }

    /* ❌ RECHAZAR */
    if (action === "reject") {
      const sadGif = random(REJECT_GIFS);

      const embed = new EmbedBuilder()
        .setDescription(
          `💔 **${interaction.user.username}** rechazó ${
            isKiss ? "el beso" : "el abrazo"
          }...\n\nQué triste momento...`
        )
        .setImage(sadGif);

      return interaction.update({
        embeds: [embed],
        components: [],
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
