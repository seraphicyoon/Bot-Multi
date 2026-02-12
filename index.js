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
    "https://media.tenor.com/2roX3uxz_68AAAAC/anime-kiss.gif",
  ],
  lesbica: [
    "https://media.tenor.com/Z6gmDPeM6dgAAAAC/anime-lesbian-kiss.gif",
  ],
  gay: [
    "https://media.tenor.com/3wvXbYpY0QMAAAAC/anime-boy-kiss.gif",
  ],
};

const TYPES = ["hetero", "lesbica", "gay"];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ========*
