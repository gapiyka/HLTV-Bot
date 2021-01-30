'use strict';

require('dotenv').config();
const { HLTV } = require('hltv');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);//BOT_TOKEN in .env file

const BUTTON_REQUESTS = {
    MATCHES: ['Live matches', 'Today+Tommorow', 'List of 15 matches', 'Intresting matches'],
    EVENTS: ['This year events', 'Large tournaments', 'Search by name'],
    PLAYERS: ['Top 10 players', 'Search by name'],
    TEAMS: ['Top 5 teams', "Search team"]
}

//FUNC::

const matchfunc = async (ctx) => {
    let data = "Choose which variation of list you want receive:";
    let matches = await HLTV.getMatches();
    let inline_keyboard = [];

    BUTTON_REQUESTS.MATCHES.forEach(element => inline_keyboard.push([
        {
            text: element,
            callback_data: element.toString(),
        },
    ]))
    const keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard,
        }),
    };

    ctx.reply(data, keyboard);
};

const eventsfunc = async (ctx) => {
    let data = 'Here is a list of upcoming tournaments:\n';
    let events = await HLTV.getEvents();

    //TODO

    ctx.reply(data);
};


const queryForLive = async (ctx) => {
    let data = 'Here is a list of live:';
    let matches = await HLTV.getMatches();
    let index = 0;

    while (matches[index].live) {
        data += `\n🎮${matches[index].team1.name} vs ${matches[index].team2.name}🎮\n`;
        index++;
    }
    if (data == 'Here is a list of live:') ctx.reply('☕️Drink cup of coffee, there are none matches now.🧩');
    else ctx.reply(data);
}

const queryForList15 = async (ctx) => {
    let data = 'Here is a list of 15 matches: \n';
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
}

const queryForDays = async (ctx) => {

}

const queryForStars = async (ctx) => {

}

const onCallbackQuery = (ctx) => {
    const data = ctx.update.callback_query.data;
    switch (data) {
        case 'Live matches': queryForLive(ctx); break;
        case 'List of 15 matches': queryForList15(ctx); break;
        case 'Today+Tommorow': queryForDays(ctx); break;
        case 'Intresting matches': queryForStars(ctx); break;
    };
};
//DEFAULT
bot.start((ctx) => {
    ctx.reply('Welcome dude',
        Markup.keyboard([
            ['Matches', 'Events'],
            ['Players', 'Teams']
        ]).resize());
});
bot.help((ctx) => ctx.reply('🖐Use buttons at bottom 👇 of screen to find info about: [Matches], [Events], [Players] or [Teams]👀'));



//HEARS + COMMANDS
bot.hears('Matches', matchfunc);


bot.hears('Events', eventsfunc);


bot.on('callback_query', ctx => {
    onCallbackQuery(ctx);
});

bot.launch();