'use strict';

require('dotenv').config();
const { HLTV } = require('hltv');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);//BOT_TOKEN in .env file

const BUTTON_REQUESTS = {
    MATCHES: ['Live matches', 'List of 15 matches', 'Intresting matches', 'Results'],
    EVENTS: ['This year events', 'Large tournaments'],
    PLAYERS: ['Top 10 players', 'Search by name'],
    TEAMS: ['HLTV top teams']
};

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const _MONTH = MONTH.map(x => x.slice(0, 3));
//FUNC::

const matchfunc = async (ctx) => {
    let data = "Choose which variation of list you want receive:";
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
    let data = "Choose one:";
    let inline_keyboard = [];

    BUTTON_REQUESTS.EVENTS.forEach(element => inline_keyboard.push([
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

const playersfunc = async (ctx) => {
    let data = "Choose one:";
    let inline_keyboard = [];

    BUTTON_REQUESTS.PLAYERS.forEach(element => inline_keyboard.push([
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

const teamsfunc = async (ctx) => {
    let data = "Choose one:";
    let inline_keyboard = [];

    BUTTON_REQUESTS.TEAMS.forEach(element => inline_keyboard.push([
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
            data += `\n${date.getDate()}-${_MONTH[date.getMonth()]} [${date.getHours()} : ${date.getMinutes()}] `;
        }
        try {
            data += `🎮${matches[i].team1.name} vs ${matches[i].team2.name}🎮`;
        } catch {
            data += `💢 Teams not declared 💢`;
        }

    }

    ctx.reply(data);
}

const queryForStars = async (ctx) => {
    let data = 'Here is a list of matches:';
    let matches = await HLTV.getMatches();

    matches.forEach(x => {
        if (x.stars > 0 && x.team1 != undefined) {
            if (x.live) data += '\nLive match: ';
            else {
                let date = new Date(x.date);
                data += `\n${date.getDate()}-${_MONTH[date.getMonth()]} [${date.getHours()} : ${date.getMinutes()}] `;
            }
            data += `\n🎮${x.team1.name} vs ${x.team2.name}🎮\n`;
        }
    })
    if (data == 'Here is a list of matches:') ctx.reply('☕️Drink cup of coffee, nothing intresting.🧩');
    else ctx.reply(data);
}

const queryForResults = async (ctx) => {
    let data = 'Here is a list of matches:';
    let results = await HLTV.getResults({ startPage: 0, endPage: 1 });

    results.forEach(x => {
        if (x.stars > 0) {
            data += `\n🎮${x.team1.name} vs ${x.team2.name} 🎮 RESULT: ${x.result} 🎮\n`;
        }
    });
    ctx.reply(data);
}

const queryForYearEvents = async (ctx) => {
    let data = '🏆T O U R N A M E N T S:🏆\n\n';
    let events = await HLTV.getEvents();

    events.forEach(kvartal => {
        data += `\n${MONTH[kvartal.month]}:\n`
        const eventsArr = kvartal.events;
        eventsArr.forEach(event => {
            let dateS = new Date(event.dateStart);
            let dateE = new Date(event.dateEnd);
            data += `🏆${event.name}🏆 | ${_MONTH[dateS.getMonth()]} ${dateS.getDate()} - ${_MONTH[dateE.getMonth()]} ${dateE.getDate()}\n`;
        });
        data += '\n';
    })

    ctx.reply(data);
}

const queryForTopEvents = async (ctx) => {
    let data = '🏆T O U R N A M E N T S:🏆\n\n';
    let events = await HLTV.getEvents();

    events.forEach(kvartal => {
        data += `${MONTH[kvartal.month].toUpperCase()}:\n`
        const eventsArr = kvartal.events;
        eventsArr.forEach(event => {
            if (event.prizePool != 'Other' && event.prizePool.length >= 8) {
                let dateS = new Date(event.dateStart);
                let dateE = new Date(event.dateEnd);
                data += `🏆${event.name}🏆\n${_MONTH[dateS.getMonth()]} ${dateS.getDate()} - ${_MONTH[dateE.getMonth()]} ${dateE.getDate()} | Prize: ${event.prizePool}💰\n\n`;
            }
        });
        data += '\n';
    })

    ctx.reply(data);
}

const queryForTopPlayers = async (ctx) => {
    let data = 'Top 10 players this year:\n\n';
    let year = new Date().getFullYear();
    let dateS = `${year}-01-01`;
    let dateE = `${year}-12-31`;
    let players = await HLTV.getPlayerRanking({
        startDate: dateS,
        endDate: dateE,
        minMapCount: 1,
        rankingFilter: 'Top20'
    });
    for (let i = 0; i < 10; i++) {
        data += `🏅${players[i].name} - ${players[i].teams[0].name}🎗\n| [Played Maps]: ${players[i].maps} | [Rating]: ${players[i].rating} |\n\n`
    }

    ctx.reply(data);
}

const queryForPlayer = (ctx) => {
    ctx.reply('Enter "p/" + <player name>\n\nExample: [p/s1mple]');
}

const queryInlineForPlayer = async (ctx) => {
    let data;
    const searchName = ctx.message.text.split('/')[1];
    try {
        let player = await HLTV.getPlayerByName({ name: searchName });
        let playerStats = player.statistics;
        data = `👦${player.name} [${player.ign}]👦\n
        Team: ${player.team.name}
        Country: ${player.country.name} || Age: ${player.age}
        🔫Statistcs:🔫
        |Rating: ${playerStats.rating} || Kills/Round: ${playerStats.killsPerRound}|
        |Headshots: ${playerStats.headshots} || Impact: ${playerStats.rating}|
        |Maps: ${playerStats.mapsPlayed} || Death/Round: ${playerStats.deathsPerRound} |\n
        https://hltv.org/player/${player.id}/${player.ign}`;
        await ctx.replyWithPhoto(player.image);
        ctx.reply(data);
    } catch {
        ctx.reply('😥Sorry but we can`t find this player in HLTV data-base');
    }
}

const queryForTopTeams = async (ctx) => {
    let data = 'Top teams for rating HLTV:\n\n';
    let teams = await HLTV.getTeamRanking();
    teams.forEach(team => {
        let change;
        if (team.change == 0) change = '🔘';
        else if (team.change > 0) change = '🔺';
        else change = '🔻';
        data += `${change} #${team.place} ${team.team.name} ~ Points: ${team.points}\n\n`;
    })

    ctx.reply(data);
}

const onCallbackQuery = (ctx) => {
    const data = ctx.update.callback_query.data;
    switch (data) {
        case 'Live matches': queryForLive(ctx); break;
        case 'List of 15 matches': queryForList15(ctx); break;
        case 'Intresting matches': queryForStars(ctx); break;
        case 'Results': queryForResults(ctx); break;
        case 'This year events': queryForYearEvents(ctx); break;
        case 'Large tournaments': queryForTopEvents(ctx); break;
        case 'Top 10 players': queryForTopPlayers(ctx); break;
        case 'Search by name': queryForPlayer(ctx); break;
        case 'HLTV top teams': queryForTopTeams(ctx); break;
    };
};



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
bot.hears('Matches', matchfunc);
bot.hears('Events', eventsfunc);
bot.hears('Players', playersfunc);
bot.hears('Teams', teamsfunc);


bot.on('callback_query', ctx => {
    onCallbackQuery(ctx);
});

bot.on('text', (ctx) => {
    if (ctx.message.text[0] == 'p' && ctx.message.text[1] == '/') queryInlineForPlayer(ctx);
})

bot.launch();