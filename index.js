require("dotenv").config();
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
   GIFS
================================ */

const KISS_GIFS = {
  hetero: [
    "https://i.imgur.com/8XbqTqS.gif",
    "https://i.imgur.com/ZQZSWrt.gif"
  ],
  lesbica: [
    "https://i.imgur.com/YiKMa5K.gif",
    "https://i.imgur.com/L8uOlIk.gif"
  ],
  gay: [
    "https://i.imgur.com/y3m6XGk.gif",
    "https://i.imgur.com/1lXKpQm.gif"
  ],
};


const TYPES = ["hetero", "lesbica", "gay"];

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
          { name: "Random", value: "random" },
          { name: "Heterosexual", value: "hetero" },
          { name: "Lésbica", value: "lesbica" },
          { name: "Gay", value: "gay" }
        )
        .setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

/* ===============================
   REGISTRO GLOBAL (TODOS LOS SERVERS)
================================ */

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  // ✅ GLOBAL: sirve para TODOS los servidores
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log("✅ Comando /kiss registrado GLOBALMENTE");
}

/* ===============================
   READY
================================ */

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  await registerCommands();
});

/* ===============================
   INTERACTIONS
================================ */

client.on("interactionCreate", async (interaction) => {
  /* --- Slash Command --- */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "kiss") return;

    const usuario = interaction.options.getUser("usuario", true);
    const tipoInput = interaction.options.getString("tipo") || "random";

    if (usuario.bot || usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes hacer eso.",
        ephemeral: true,
      });
    }

    const tipo = tipoInput === "random" ? random(TYPES) : tipoInput;

    const pool = KISS_GIFS[tipo] || [];
    if (pool.length === 0) {
      return interaction.reply({
        content: `⚠️ No tengo GIFs para el tipo **${tipo}** todavía.`,
        ephemeral: true,
      });
    }

    const gif = random(pool);

    const embed = new EmbedBuilder()
      .setDescription(`💋 **${interaction.user.username}** besa a **${usuario.username}**`)
      .setImage(gif)
      .setFooter({ text: "¿Corresponderás el beso?" });

    // Guardamos el ID del “besador” y el “besado” para controlar quién puede tocar botones
    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`kiss_back_${interaction.user.id}_${usuario.id}`)
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
    // customId: kiss_back_<autorId>_<targetId>  o  kiss_reject_<autorId>_<targetId>
    const action = parts[0]; // "kiss"
    const type = parts[1];   // "back" o "reject"
    const autorId = parts[2];
    const targetId = parts[3];

    if (action !== "kiss") return;

    // ✅ Solo la persona besada (targetId) puede responder
    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: "⚠️ Solo la persona a la que besaron puede responder.",
        ephemeral: true,
      });
    }

    if (type === "back") {
      await interaction.update({
        content: `💖 **${interaction.user.username}** devolvió el beso a **${client.users.cache.get(autorId)?.username || "alguien"}**!`,
        embeds: [],
        components: [],
      });
    } else if (type === "reject") {
      await interaction.update({
        content: `💔 **${interaction.user.username}** rechazó el beso...`,
        embeds: [],
        components: [],
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
