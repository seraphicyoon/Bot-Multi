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
   SISTEMA DE CONTADOR
================================ */

const DATA_FILE = "./kisses.json";

let kissData = {};

if (fs.existsSync(DATA_FILE)) {
  kissData = JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(kissData, null, 2));
}

function getPairKey(id1, id2) {
  return [id1, id2].sort().join("_");
}

function addKiss(id1, id2) {
  const key = getPairKey(id1, id2);
  if (!kissData[key]) kissData[key] = 0;
  kissData[key]++;
  saveData();
  return kissData[key];
}

/* ===============================
   GIFS
================================ */

const KISS_GIFS = {
  yuri: [
    "https://i.imgur.com/YiKMa5K.gif",
    "https://i.imgur.com/L8uOlIk.gif",
    "https://i.imgur.com/5uWZQHD.gif",
    "https://i.imgur.com/5FwrWiG.gif",
  ],
  yaoi: [
    "https://i.imgur.com/y3m6XGk.gif",
    "https://i.imgur.com/1lXKpQm.gif",
  ],
};

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ===============================
   SLASH COMMAND
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

  console.log("✅ Comando /kiss registrado GLOBALMENTE");
}

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  await registerCommands();
});

/* ===============================
   INTERACCIONES
================================ */

client.on("interactionCreate", async (interaction) => {
  /* --- Slash Command --- */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "kiss") return;

    const usuario = interaction.options.getUser("usuario", true);
    const tipo = interaction.options.getString("tipo", true);

    if (usuario.bot || usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes hacer eso.",
        ephemeral: true,
      });
    }

    const gif = random(KISS_GIFS[tipo]);

    const count = addKiss(interaction.user.id, usuario.id);

    const embed = new EmbedBuilder()
      .setDescription(
        `💋 **${interaction.user.username}** besa a **${usuario.username}**\n\n` +
        `💞 Se han besado **${count}** veces.`
      )
      .setImage(gif)
      .setFooter({ text: "¿Corresponderás el beso?" });

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`kiss_back_${interaction.user.id}_${usuario.id}_${tipo}`)
        .setLabel("💋 Besar de vuelta")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`kiss_reject_${interaction.user.id}_${usuario.id}`)
        .setLabel("❌ Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [botones],
    });
  }

  /* --- Botones --- */
  if (interaction.isButton()) {
    const parts = interaction.customId.split("_");
    const action = parts[1];
    const autorId = parts[2];
    const targetId = parts[3];
    const tipo = parts[4];

    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: "⚠️ Solo la persona besada puede responder.",
        ephemeral: true,
      });
    }

    if (action === "back") {
      const count = addKiss(autorId, targetId);

      const gif = random(KISS_GIFS[tipo]);

      const embed = new EmbedBuilder()
        .setDescription(
          `💖 **${interaction.user.username}** devolvió el beso!\n\n` +
          `💞 Ahora se han besado **${count}** veces.`
        )
        .setImage(gif);

      await interaction.update({
        embeds: [embed],
        components: [],
      });
    }

    if (action === "reject") {
      await interaction.update({
        content: `💔 **${interaction.user.username}** rechazó el beso...`,
        embeds: [],
        components: [],
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
