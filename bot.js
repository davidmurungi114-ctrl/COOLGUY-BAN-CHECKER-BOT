// 🐺 COOLGUY BAN CHECKER V2 - SAFE BOT - BY COOLGUY THE HUCKER
// NO Baileys, NO WhatsApp checking - Just opens website + menu
// Put your token in Environment Variable: BOT_TOKEN - NEVER paste it in code!

const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.log('❌ ERROR: Set BOT_TOKEN in your hosting settings!');
  process.exit(1);
}

const OWNER = 'PROFESSOR COOLGUY';
const BOT_USERNAME = '@coolguy_ban_checker_v2_bot';
const BOT_LINK = 'http://t.me/coolguy_ban_checker_v2_bot';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://davidmurungi114-ctrl.github.io/COOLGUY-BAN-CHECKER-BOT/';

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

let historyDB = {};
let langDB = {};

function cleanNumber(t){ return (t||'').replace(/[^0-9]/g,''); }

// 💙 BLUE BUTTON - Opens your WEBSITE
function blueButton(){ return Markup.button.webApp('💙 OPEN BAN CHECKER 💙', WEBAPP_URL); }

function mainKeyboard(){
  return Markup.inlineKeyboard([
    [Markup.button.callback('📖 How To Check', 'howto'), Markup.button.callback('👤 Guest Mode', 'guest')],
    [blueButton()],
    [Markup.button.callback('📜 My History', 'history'), Markup.button.callback('📰 Subscribe to News', 'news')],
    [Markup.button.callback('🌐 Language', 'language')]
  ]);
}

function startText(){
  return `🐺 COOLGUY BAN CHECKER\n\nWelcome to Coolguy Ban Checker.\nCheck your own WhatsApp ban status on our website.\n\nCommand | Action\n/start — COOLGUY BAN CHECKER\n/history — Your Search History\n/language — Language\n\n👇 TAP THE BLUE BUTTON TO OPEN CHECKER 👇\n\n👑 By ${OWNER}`;
}

bot.start(async (ctx)=>{
  await ctx.reply(startText(), mainKeyboard());
  await ctx.reply(`👇 TAP THE BLUE BUTTON TO OPEN CHECKER 👇`, Markup.inlineKeyboard([[blueButton()]]));
});

bot.action('back', async (ctx)=>{ await ctx.editMessageText(startText(), mainKeyboard()); });

bot.action('howto', async (ctx)=>{
  await ctx.editMessageText(`🐺 COOLGUY BAN CHECKER\n\n📖 HOW TO CHECK YOUR OWN NUMBER\n\n1. Tap 💙 OPEN BAN CHECKER 💙\n2. Type YOUR OWN number with + country code\n   Example: +256750765838\n3. Tap Check a Number\n4. Follow the checklist on the website\n\n⚠️ Only check YOUR OWN number.\nDo not check other people's numbers.\n\nSpaces, brackets, dots and hyphens are automatically removed.`,
  Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')], [blueButton()], [Markup.button.callback('📰 Subscribe to News', 'news')]]));
});

bot.action('guest', async (ctx)=>{
  await ctx.editMessageText(`🐺 COOLGUY BAN CHECKER\n\n👤 GUEST MODE\nOpen the website from any chat:\n${BOT_LINK}\n\nTap the blue button to open the checker.`,
  Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')], [blueButton()]]));
});

bot.action('news', async (ctx)=>{ await ctx.reply('📰 Subscribed to COOLGUY News! 🐺'); });

bot.action('language', async (ctx)=>{
  await ctx.editMessageText('Choose your language\nYou can change later with /language',
  Markup.inlineKeyboard([
    [Markup.button.callback('🇬🇧 English', 'lang_en'), Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    [Markup.button.callback('🇪🇸 Español', 'lang_es'), Markup.button.callback('🇫🇷 Français', 'lang_fr')],
    [Markup.button.callback('🇸🇦 العربية', 'lang_ar'), Markup.button.callback('🇮🇳 हिन्दी', 'lang_hi')],
    [Markup.button.callback('⬅️ Back', 'back')]
  ]));
});

bot.action(/lang_(.+)/, async (ctx)=>{
  langDB[ctx.from.id]=ctx.match[1];
  await ctx.reply('✅ Language set! /start');
});

bot.command('history', async (ctx)=>{
  let h = historyDB[ctx.from.id] || [];
  if(h.length===0) return ctx.reply('📜 No history yet! Open the checker first!', Markup.inlineKeyboard([[blueButton()]]));
  let text = `🐺 COOLGUY BAN CHECKER\n📜 Your Search History (${h.length})\n\n`;
  h.slice(-20).reverse().forEach(x=>{ text += `\n${x.number} | ${x.date}`; });
  await ctx.reply(text, Markup.inlineKeyboard([[blueButton()], [Markup.button.callback('⬅️ Back', 'back')]]));
});

bot.action('history', async (ctx)=>{ await ctx.reply('Send /history'); });

// SAFE: Bot does NOT check WhatsApp. It just guides user to website.
bot.on('text', async (ctx)=>{
  let raw = ctx.message.text.trim();
  if(raw.startsWith('/')) return;
  let clean = cleanNumber(raw);
  if(clean.length >= 10 && clean.length <= 15){
    // Save to history locally only, no WhatsApp lookup
    if(!historyDB[ctx.from.id]) historyDB[ctx.from.id]=[];
    historyDB[ctx.from.id].push({ number: '+'+clean, date: new Date().toLocaleString('en-GB',{timeZone:'Africa/Kampala'}) });
    await ctx.reply(`✅ Got +${clean}\n\n👉 To check YOUR OWN number, tap the blue button to open the website and follow the checklist there.`, Markup.inlineKeyboard([[blueButton()]]));
  } else {
    await ctx.reply('❌ Send your own valid number! Example: +256750765838', Markup.inlineKeyboard([[blueButton()]]));
  }
});

app.get('/', (req,res)=> res.json({ brand:'COOLGUY BAN CHECKER', owner:OWNER, status:'ONLINE ✅' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🐺 COOLGUY V2 SAFE BOT on ${PORT}`));
bot.launch().then(()=> console.log('🐺 COOLGUY BAN CHECKER V2 SAFE ONLINE!'));
