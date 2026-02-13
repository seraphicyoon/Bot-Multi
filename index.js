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

/* Archivos JSON */
const KISSES_FILE = "./kisses.json";
const HUGS_FILE = "./hugs.json";
const PATS_FILE = "./pats.json";
const SLAPS_FILE = "./slaps.json";
const POKES_FILE = "./pokes.json";
const TOMATOES_FILE = "./tomatoes.json";

let kissData = loadJson(KISSES_FILE);
let hugData = loadJson(HUGS_FILE);
let patData = loadJson(PATS_FILE);
let slapData = loadJson(SLAPS_FILE);
let pokeData = loadJson(POKES_FILE);
let tomatoData = loadJson(TOMATOES_FILE);

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

const HUG_GIFS = {
  yuri: [
    "https://i.imgur.com/ngMo9CD.gif",
    "https://i.imgur.com/2c3VtcJ.gif",
  ],
  yaoi: [
    "https://i.imgur.com/VWDJxHg.gif",
    "https://i.imgur.com/UEeB0GF.gif",
  ],
};

const PAT_GIFS = {
  yuri: [
    "https://tenor.com/view/anime-pat-anime-girl-anime-yuri-yuri-uchi-no-shishou-wa-shippo-ga-nai-gif-26977641",
    "https://tenor.com/view/headpat-anime-yuru-yuri-funami-yui-gif-18301276",
    "https://tenor.com/view/petpet-yuri-gif-14131081902881733670",
  ],
  yaoi: [
    "https://tenor.com/view/head-pat-anime-gif-12345678",
    "https://giphy.com/gifs/anime-head-pat-l0HlBO7eyXzSZkJri",
  ],
};

const SLAP_GIFS = {
  yuri: [
    "https://tenor.com/view/spy-x-family-yor-yuri-slap-gif-27020208",
  ],
  yaoi: [
    "https://tenor.com/view/anime-slap-boy-boy-gif-example",
  ],
};

const POKE_GIFS = {
  yuri: [
    "https://tenor.com/view/anime-poke-yuri-girl-poke-cheek-gif-12345",
  ],
  yaoi: [
    "https://tenor.com/view/anime-poke-boy-poke-gif-67890",
  ],
};

/* GIF para /tomato - ¡REEMPLAZA ESTE ENLACE CON EL TUYO! */
const TOMATO_GIF = "https://tu-gif-del-perrito-tomateado-aqui.gif";  // ← CAMBIA ESTO OBLIGATORIAMENTE

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
      option.setName("usuario").setDescription("¿A quién quieres besar?").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices({ name: "Yuri", value: "yuri" }, { name: "Yaoi", value: "yaoi" })
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Abraza a alguien 🤗")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("¿A quién quieres abrazar?").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices({ name: "Yuri", value: "yuri" }, { name: "Yaoi", value: "yaoi" })
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Acaricia la cabeza a alguien 🖐️")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("¿A quién quieres acariciar?").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices({ name: "Yuri", value: "yuri" }, { name: "Yaoi", value: "yaoi" })
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Dale una bofetada a alguien 👋 (tsundere mode)")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("¿A quién quieres abofetear?").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices({ name: "Yuri", value: "yuri" }, { name: "Yaoi", value: "yaoi" })
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Pincha a alguien 👉")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("¿A quién quieres pinchar?").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription("Tipo de pareja")
        .addChoices({ name: "Yuri", value: "yuri" }, { name: "Yaoi", value: "yaoi" })
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("tomato")
    .setDescription("Lanza un tomate a alguien 🍅 (¡splat!)")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("¿A quién le quieres lanzar un tomate?").setRequired(true)
    ),
].map((cmd) => cmd.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });
  console.log("✅ Comandos registrados: kiss, hug, pat, slap, poke, tomato");
}

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  await registerCommands();
});

/* ===============================
   INTERACCIONES
================================ */
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;
    if (!["kiss", "hug", "pat", "slap", "poke", "tomato"].includes(cmd)) return;

    const usuario = interaction.options.getUser("usuario", true);
    let tipo = null;

    if (cmd !== "tomato") {
      tipo = interaction.options.getString("tipo", true);
    }

    if (usuario.bot || usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes hacer eso contigo mismo o con un bot.",
        ephemeral: true,
      });
    }

    const gifsMap = {
      kiss: KISS_GIFS,
      hug: HUG_GIFS,
      pat: PAT_GIFS,
      slap: SLAP_GIFS,
      poke: POKE_GIFS,
      tomato: { default: [TOMATO_GIF] },
    };

    const dataMap = {
      kiss: { data: kissData, file: KISSES_FILE },
      hug: { data: hugData, file: HUGS_FILE },
      pat: { data: patData, file: PATS_FILE },
      slap: { data: slapData, file: SLAPS_FILE },
      poke: { data: pokeData, file: POKES_FILE },
      tomato: { data: tomatoData, file: TOMATOES_FILE },
    };

    const gifs = gifsMap[cmd];
    let pool = cmd === "tomato" ? gifs.default : gifs[tipo] || [];

    if (!pool.length) {
      return interaction.reply({
        content: `⚠️ No tengo GIF(s) para **${cmd}**${tipo ? ` tipo ${tipo}` : ""}.`,
        ephemeral: true,
      });
    }

    const gif = random(pool);
    const { data: store, file } = dataMap[cmd];
    const count = addCount(store, file, interaction.user.id, usuario.id);

    const emojiMap = {
      kiss: "💋", hug: "🤗", pat: "🖐️", slap: "👋", poke: "👉", tomato: "🍅",
    };
    const verboMap = {
      kiss: "besa", hug: "abraza", pat: "acaricia la cabeza de",
      slap: "le da una bofetada a", poke: "pincha a", tomato: "le lanza un tomate a",
    };
    const verboPasadoMap = {
      kiss: "besado", hug: "abrazado", pat: "acariciado",
      slap: "abofeteado", poke: "pinchado", tomato: "lanzado tomates",
    };

    const emoji = emojiMap[cmd];
    const verbo = verboMap[cmd];
    const verboPasado = verboPasadoMap[cmd];

    const footer = cmd === "tomato"
      ? "¿Le devolverás el tomate? 🍅"
      : `¿Corresponderás el ${cmd === "slap" ? "golpe" : cmd === "poke" ? "pinchazo" : cmd}?`;

    const embed = new EmbedBuilder()
      .setDescription(
        `${emoji} **${interaction.user.username}** ${verbo} **${usuario.username}**!\n\n` +
        `💞 Se han ${verboPasado} **${count}** veces.`
      )
      .setImage(gif)
      .setFooter({ text: footer });

    if (cmd === "tomato") embed.setColor(0xFF6347); // color tomate

    const backLabelMap = {
      kiss: "💋 Besar de vuelta",
      hug: "🤗 Abrazar de vuelta",
      pat: "🖐️ Acariciar de vuelta",
      slap: "👋 Devolver la bofetada",
      poke: "👉 Pinchar de vuelta",
      tomato: "🍅 Lanzar tomate de vuelta",
    };

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${cmd}_back_${interaction.user.id}_${usuario.id}${tipo ? `_${tipo}` : ""}`)
        .setLabel(backLabelMap[cmd])
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

  if (interaction.isButton()) {
    const parts = interaction.customId.split("_");
    const cmd = parts[0];
    const action = parts[1];
    const autorId = parts[2];
    const targetId = parts[3];
    const tipo = parts[4]; // undefined para tomato

    if (!["kiss", "hug", "pat", "slap", "poke", "tomato"].includes(cmd)) return;

    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: "⚠️ Solo la persona mencionada puede responder.",
        ephemeral: true,
      });
    }

    const gifsMap = {
      kiss: KISS_GIFS, hug: HUG_GIFS, pat: PAT_GIFS,
      slap: SLAP_GIFS, poke: POKE_GIFS,
      tomato: { default: [TOMATO_GIF] },
    };

    const dataMap = {
      kiss: { data: kissData, file: KISSES_FILE },
      hug: { data: hugData, file: HUGS_FILE },
      pat: { data: patData, file: PATS_FILE },
      slap: { data: slapData, file: SLAPS_FILE },
      poke: { data: pokeData, file: POKES_FILE },
      tomato: { data: tomatoData, file: TOMATOES_FILE },
    };

    if (action === "back") {
      const gifs = gifsMap[cmd];
      const pool = cmd === "tomato" ? gifs.default : gifs[tipo] || [];
      const gif = random(pool);

      const { data: store, file } = dataMap[cmd];
      const count = addCount(store, file, autorId, targetId);

      const embed = new EmbedBuilder()
        .setDescription(
          `💖 **${interaction.user.username}** ¡devolvió el ${cmd === "tomato" ? "tomate" : cmd === "slap" ? "golpe" : cmd === "poke" ? "pinchazo" : cmd}!\n\n` +
          `Ahora se han ${verboPasadoMap[cmd]} **${count}** veces.`
        )
        .setImage(gif);

      if (cmd === "tomato") embed.setColor(0xFF6347);

      return interaction.update({ embeds: [embed], components: [] });
    }

    if (action === "reject") {
      const sadGif = random(REJECT_GIFS);
      const embed = new EmbedBuilder()
        .setDescription(
          `💔 **${interaction.user.username}** rechazó el ${cmd === "tomato" ? "tomatazo" : cmd}...\n\nQué triste...`
        )
        .setImage(sadGif);

      return interaction.update({ embeds: [embed], components: [] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
