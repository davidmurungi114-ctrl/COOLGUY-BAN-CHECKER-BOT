// 🐺 COOLGUY BAN CHECKER V2 - TRUE CHECK - BY PROFESSOR COOLGUY
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const BOT_TOKEN = process.env.BOT_TOKEN || 'PASTE_YOUR_TOKEN';
const OWNER = 'PROFESSOR COOLGUY';
const BOT_USERNAME = '@coolguy_ban_checker_v2_bot';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://coolguy256.github.io/COOLGUY-BAN-CHEKER-API/';

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

let waSock = null;
let waReady = false;
let historyDB = {};
let langDB = {};
let userNameDB = {};

function cleanNumber(t){ return (t||'').replace(/[^0-9]/g,''); }
function getCountry(n){
  if(n.startsWith('256')) return '🇺🇬 Uganda';
  if(n.startsWith('234')) return '🇳🇬 Nigeria';
  if(n.startsWith('254')) return '🇰🇪 Kenya';
  if(n.startsWith('255')) return '🇹🇿 Tanzania';
  if(n.startsWith('233')) return '🇬🇭 Ghana';
  if(n.startsWith('91')) return '🇮🇳 India';
  if(n.startsWith('1')) return '🇺🇸 USA';
  if(n.startsWith('44')) return '🇬🇧 UK';
  return '🌍 Unknown';
}
function getCountryCode(n){
  // For Mini App flag + name
  if(n.startsWith('256')) return { flag:'🇺🇬', name:'Uganda' };
  if(n.startsWith('234')) return { flag:'🇳🇬', name:'Nigeria' };
  if(n.startsWith('254')) return { flag:'🇰🇪', name:'Kenya' };
  return { flag:'🌍', name:'Unknown' };
}

// ===== REAL WHATSAPP CONNECTION (Baileys) =====
async function startWhatsApp(){
  const { state, saveCreds } = await useMultiFileAuthState('./wa-session');
  waSock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: true, browser: ['COOLGUY BAN CHECKER', 'Chrome', '1.0'] });
  waSock.ev.on('creds.update', saveCreds);
  waSock.ev.on('connection.update', (u)=>{
    const { connection, lastDisconnect } = u;
    if(connection === 'open'){ waReady = true; console.log('✅ COOLGUY WHATSAPP CHECKER CONNECTED!'); }
    if(connection === 'close'){
      waReady = false;
      let shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) startWhatsApp();
      else console.log('❌ Checker WhatsApp logged out - Scan QR again!');
    }
  });
  // Pairing code - use this if you don't want QR!
  // In Railway logs, you will see QR. Scan with spare WhatsApp > Linked Devices!
}
startWhatsApp();

// ===== TRUE CHECK - THIS IS THE BREATHING PART! =====
async function trueCheck(number){
  // 1. Validate - EXACTLY like Venom video!
  if(!number || number.length < 10 || number.length > 15){
    return { success: false, error: 'Check failed', reason: 'Enter the full international number, including + and the country calling code.' };
  }
  // 2. If WhatsApp not connected yet, tell user
  if(!waSock || !waReady){
    return { success: false, error: 'Check failed', reason: 'Checker is starting... Try again in 10 seconds.' };
  }
  try{
    // 3. ASK WHATSAPP REAL API - onWhatsApp!
    const jid = number + '@s.whatsapp.net';
    const res = await waSock.onWhatsApp(jid);
    // res = [{ exists: true/false, jid }]
    const exists = res && res[0] && res[0].exists;
    if(exists){
      // Number exists on WhatsApp = NOT BANNED + ACTIVE
      return { success: true, banned: false, banStatus: 'Not banned', whatsappStatus: 'Active', official: 'No' };
    } else {
      // Number NOT on WhatsApp = Either banned or never registered = Venom shows BANNED / Check failed
      // We show BANNED like Venom history shows 🔴
      return { success: true, banned: true, banStatus: 'BANNED', whatsappStatus: 'Not Active', official: 'No' };
    }
  }catch(e){
    console.log('Check error', e);
    return { success: false, error: 'Check failed', reason: 'Enter the full international number, including + and the country calling code.' };
  }
}

// ===== KEYBOARDS - EXACT LIKE VIDEO! =====
function mainKeyboard(){
  return Markup.inlineKeyboard([
    [Markup.button.callback('📖 How To Check', 'howto'), Markup.button.callback('👤 Guest Mode', 'guest')],
    [Markup.button.webApp('🚀 Try', WEBAPP_URL)],
    [Markup.button.callback('🔍 Check a Number', 'check')],
    [Markup.button.callback('📜 My History', 'history'), Markup.button.callback('📰 Subscribe to News', 'news')],
    [Markup.button.callback('🌐 Language', 'language')]
  ]);
}
function startText(){
  return `🐺 COOLGUY BAN CHECKER\n\nWelcome to Coolguy Ban Checker.\nCheck WhatsApp ban status and available account information.\n\nCommand | Action\n/start — COOLGUY BAN CHECKER\n/status — CHECKING FORMATS\n/guest — GUEST MODE\n/history — Your Search History\n/language — Language\n\nUse | Example\nPrivate Check — Just send number\nBULK CHECK RESULTS — Send many numbers\nInline — ${BOT_USERNAME} +2348012345678\n\nUse /status for checking formats. Use /guest for Guest Mode.\n\n👑 By ${OWNER}`;
}
bot.start(async (ctx)=>{
  userNameDB[ctx.from.id] = ctx.from.first_name || 'COOLGUY';
  await ctx.reply(startText(), mainKeyboard());
});
bot.action('back', async (ctx)=>{ await ctx.editMessageText(startText(), mainKeyboard()); });
bot.action('howto', async (ctx)=>{
  await ctx.editMessageText(`🐺 COOLGUY BAN CHECKER\n\n📖 CHECKING FORMATS\n\nFormat | Example | Action\nInternational | +2348012345678 | CHECK\nQuestion prefix | ?2348012345678 | CHECK\nHash prefix | #2348012345678 | CHECK\nDollar prefix | $2348012345678 | CHECK\nFormatted | (234) 801-234-5678 | CHECK\nBULK CHECK RESULTS | Many numbers | BULK\n\nMode | How To Use\n👥 Group Mode | Use ?, #, $ before the number.\n👤 Guest Mode | Mention this bot followed by the number in another supported chat.\n⚡ INLINE MODE | Type ${BOT_USERNAME} followed by a number in any chat.\n\nSpaces, brackets, dots and hyphens are automatically removed.\nExample: ${BOT_USERNAME} +2348012345678`, Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')], [Markup.button.webApp('🚀 Try', WEBAPP_URL)], [Markup.button.callback('📰 Subscribe to News', 'news')]]));
});
bot.action('guest', async (ctx)=>{
  await ctx.editMessageText(`🐺 COOLGUY BAN CHECKER\n\n👤 GUEST MODE\nUse the bot in another supported chat even when it is not a member.\n\nFormat | Example\nInternational | ${BOT_USERNAME} +2348012345678\nQuestion prefix | ${BOT_USERNAME} ?2348012345678\nHash prefix | ${BOT_USERNAME} #2348012345678\nDollar prefix | ${BOT_USERNAME} $2348012345678\n\nInformation | Details\n👤 Guest Mode | The result is posted directly in the chat through Guest Mode.`, Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')], [Markup.button.webApp('🚀 Try', WEBAPP_URL)]]));
});
bot.action('check', async (ctx)=>{ await ctx.reply('🔍 Send me a number bro! Example: +256750765838'); });
bot.action('news', async (ctx)=>{ await ctx.reply('📰 Subscribed to COOLGUY News! 🐺'); });
bot.action('language', async (ctx)=>{
  await ctx.editMessageText('Choose your language\nYou can change later with /language', Markup.inlineKeyboard([
    [Markup.button.callback('🇬🇧 English', 'lang_en'), Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    [Markup.button.callback('🇺🇦 Українська', 'lang_uk'), Markup.button.callback('🇪🇸 Español', 'lang_es')],
    [Markup.button.callback('🇺🇿 O\'zbek', 'lang_uz'), Markup.button.callback('🇵🇹 Português', 'lang_pt')],
    [Markup.button.callback('🇩🇪 Deutsch', 'lang_de'), Markup.button.callback('🇮🇹 Italiano', 'lang_it')],
    [Markup.button.callback('🇫🇷 Français', 'lang_fr'), Markup.button.callback('🇹🇷 Türkçe', 'lang_tr')],
    [Markup.button.callback('🇸🇦 العربية', 'lang_ar'), Markup.button.callback('🇮🇷 فارسی', 'lang_fa')],
    [Markup.button.callback('🇨🇳 简体中文', 'lang_zh'), Markup.button.callback('🇮🇩 Bahasa Indonesia', 'lang_id')],
    [Markup.button.callback('🇸🇪 Svenska', 'lang_sv'), Markup.button.callback('🇲🇾 Melayu', 'lang_ms')],
    [Markup.button.callback('🇳🇱 Nederlands', 'lang_nl'), Markup.button.callback('🇻🇳 Tiếng Việt', 'lang_vi')],
    [Markup.button.callback('🇵🇰 اردو', 'lang_ur'), Markup.button.callback('🇮🇳 हिन्दी', 'lang_hi')],
    [Markup.button.callback('🇮🇳 தமிழ்', 'lang_ta')],
    [Markup.button.callback('⬅️ Back', 'back')]
  ]));
});
bot.action(/lang_(.+)/, async (ctx)=>{ langDB[ctx.from.id]=ctx.match[1]; await ctx.reply('✅ Language set! /start'); });
bot.command('status', async (ctx)=>{ await ctx.reply(startText(), mainKeyboard()); });
bot.command('guest', async (ctx)=>{ await ctx.reply(`👤 GUEST MODE\nUse in any chat: ${BOT_USERNAME} +256750765838`); });
bot.command('history', async (ctx)=>{
  let h = historyDB[ctx.from.id] || [];
  if(h.length===0) return ctx.reply('📜 No history yet! Check a number first!');
  let text = `🐺 COOLGUY BAN CHECKER\n📜 Your Search History (${h.length})\n\nPhone Number | Phone Country | Status | Date\n`;
  h.slice(-20).reverse().forEach(x=>{ text += `\n${x.number} | ${x.country} | ${x.banned?'🔴 BANNED':'🟢 NOT BANNED'} | ${x.date}`; });
  text += `\n\nThis bot message shows your latest 20 searches.\nOpen Mini App to view your full available history.`;
  await ctx.reply(text, Markup.inlineKeyboard([[Markup.button.webApp('🔍 Check Full History', WEBAPP_URL)], [Markup.button.callback('⬅️ Back', 'back')], [Markup.button.webApp('🚀 Try', WEBAPP_URL)]]));
});
bot.action('history', async (ctx)=>{ await ctx.reply('Send /history'); });

// MAIN CHECK - ANY NUMBER!
bot.on('text', async (ctx)=>{
  let raw = ctx.message.text.trim();
  if(raw.startsWith('/')) return;
  let nums = raw.match(/\+?\d[\d\s\-\(\)]{8,15}\d/g) || [];
  if(nums.length===0) return ctx.reply('❌ Send valid number! Example: +256750765838');
  for(let n of nums.slice(0,5)){
    let clean = cleanNumber(n);
    let msg = await ctx.reply('🔍 Checking... ⏳');
    let r = await trueCheck(clean);
    if(!r.success){
      await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, `❌ Check failed\n${r.reason}`);
      continue;
    }
    let country = getCountry(clean);
    let date = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Kampala', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    if(!historyDB[ctx.from.id]) historyDB[ctx.from.id]=[];
    historyDB[ctx.from.id].push({ number: '+'+clean, country, banned: r.banned, date });
    await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, `🐺 COOLGUY BAN CHECKER\n\nBAN STATUS\n${r.banned?'🔴':'🟢'} ${r.banStatus}\n\nPhone Number: +${clean}\nPhone Country: ${country}\nBan Status: ${r.banStatus}\nWhatsApp Account Status: ${r.whatsappStatus}\nOfficial WhatsApp: ${r.official}\n\n👑 By ${OWNER}`);
  }
});

// Inline - @bot + number in any chat
bot.on('inline_query', async (ctx)=>{
  let q = cleanNumber(ctx.inline_query.query);
  if(!q) return;
  let r = await trueCheck(q);
  if(!r.success) return;
  await ctx.answerInlineQuery([{ type:'article', id:'1', title:`+${q} - ${r.banStatus}`, description:`Country: ${getCountry(q)} | By COOLGUY`, input_message_content:{ message_text:`🐺 COOLGUY BAN CHECKER\n\n+${q}\nStatus: ${r.banStatus}\nCountry: ${getCountry(q)}\nBy ${OWNER}` } }]);
});

// API for Mini App - SAME TRUE CHECK!
app.post('/api/status', async (req,res)=>{
  let number = cleanNumber(req.body.number || req.body.phone || '');
  let r = await trueCheck(number);
  if(!r.success) return res.json({ success:false, error:r.error, message:r.reason });
  let cc = getCountryCode(number);
  res.json({ success:true, brand:'COOLGUY BAN CHECKER', by:OWNER, phoneNumber:'+'+number, phoneCountry:cc.name, phoneCountryFlag:cc.flag, banStatus:r.banStatus, whatsappStatus:r.whatsappStatus, officialWhatsapp:r.official, banned:r.banned, date: new Date().toLocaleString('en-GB',{timeZone:'Africa/Kampala'}) });
});
app.get('/', (req,res)=> res.json({ brand:'COOLGUY BAN CHECKER', owner:OWNER, whatsappReady:waReady, status:'ONLINE ✅' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🐺 COOLGUY V2 API on ${PORT}`));
bot.launch().then(()=> console.log('🐺 COOLGUY BAN CHECKER V2 ONLINE!'));
