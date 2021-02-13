'use strict';

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const FUNCTIONS = require('./functions');

const bot = new Telegraf(process.env.BOT_TOKEN);//BOT_TOKEN in .env file


//DEFAULT
bot.start((ctx) => {
    ctx.reply('🖐Welcome to HLTV HELP BOT🖐',
        Markup.keyboard([
            ['Matches', 'Events'],
            ['Players', 'Teams']
        ]).resize());
});
bot.help((ctx) => ctx.reply('🖐Use buttons at bottom 👇 of screen to find info about: [Matches], [Events], [Players] or [Teams]👀'));


//HEARS + COMMANDS
bot.hears('Matches', FUNCTIONS.matchfunc);
bot.hears('Events', FUNCTIONS.eventsfunc);
bot.hears('Players', FUNCTIONS.playersfunc);
bot.hears('Teams', FUNCTIONS.teamsfunc);

bot.command('subscribe', (ctx) => {
    if (ctx.message.text.length > 10) FUNCTIONS.commandForSubscribe(bot, ctx, ctx.message.text);
    else ctx.reply('Please input [/subscribe <TEAM>] || For example: [/subscribe Astralis]');
});

bot.command('unsubscribe', (ctx) => {
    FUNCTIONS.commandForDelSubscribe(ctx);
});

bot.command('news', (ctx) => {
    FUNCTIONS.queryForNews(ctx);
});

bot.command('git', (ctx) => {
    FUNCTIONS.queryForGit(ctx);
});

bot.command('stream', async (ctx) => {
    await ctx.replyWithSticker(FUNCTIONS.GetStickerUrl());
    if (ctx.message.text.length > 12) FUNCTIONS.queryForStream(ctx, ctx.message.text);
    else ctx.reply('Please input [/stream <MATCH_ID>] || For example: [/stream 2346068]');
});

bot.on('callback_query', ctx => {
    FUNCTIONS.onCallbackQuery(ctx);
});

bot.on('text', (ctx) => {
    if (ctx.message.text[0] == 'p' && ctx.message.text[1] == '/') FUNCTIONS.queryInlineForPlayer(ctx);
})

FUNCTIONS.LoadBot(bot);
bot.launch();