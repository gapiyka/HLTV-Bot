require('dotenv').config();
const { HLTV } = require('hltv');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);//BOT_TOKEN in .env file

//DEFAULT
bot.start((ctx) => {
    ctx.reply('Welcome dude',
        Markup.keyboard([
            ['Matches', 'Events'],
            ['Players', 'Teams']
        ]).resize());
});
bot.help((ctx) => ctx.reply('Use button at bottom of screen'));


//HEARS + COMMANDS
bot.hears('Matches', async (ctx) => {
    let data = 'Here is a 15 ongoing matches: \n';
    let matches = await HLTV.getMatches();

    for (let i = 0; i < 15; i++) {
        if (matches[i].live) data += '\nLive match: ';
        else {
            let date = new Date(matches[i].date);
            data += `\n${date.getFullYear()}-${date.getDate()}-${date.getMonth()} [${date.getHours()} : ${date.getMinutes()}] `;
        }
        try {
            data += `🎮${matches[i].team1.name} vs ${matches[i].team2.name}🎮`;
        } catch {
            data += `💢 Teams not declared 💢`;
        }

    }
    ctx.reply(data);
});

bot.hears('Events', async (ctx) => {
    let data = 'Here is a list of upcoming tournaments:\n';
    let events = await HLTV.getEvents();

    //TODO

    ctx.reply(data);
});


bot.launch();


//FUNCTIONS::