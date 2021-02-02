'use strict';

const { HLTV } = require('hltv');

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const _MONTH = MONTH.map(x => x.slice(0, 3));
const BUTTON_REQUESTS = {
    MATCHES: ['Live matches', 'List of 15 matches', 'Intresting matches', 'Results'],
    EVENTS: ['This year events', 'Large tournaments'],
    PLAYERS: ['Top 10 players', 'Search by name'],
    TEAMS: ['HLTV top teams']
};
const USERS_SUBSCRIPTIONS = [];
let SUB_TIMER = [];

function ThisDay(value) {
    const today = new Date().getDate();
    const dayOfGame = new Date(value.date).getDate();
    return today == dayOfGame;
}

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

const subFunc = (ctx, search) => {
    let user = USERS_SUBSCRIPTIONS.find(user => { if (user.userID == ctx.message.from.id) return user });
    let teamID = search.team.id;
    if (user == undefined) {
        USERS_SUBSCRIPTIONS.push({ userID: ctx.message.from.id, subs: [teamID] });
        SUB_TIMER.push(setInterval(() => CheckOnSub(ctx), 1200000));
        ctx.reply('✅You add this team to your list of subscriptions');
    } else if (user.subs.includes(teamID)) {
        ctx.reply('You already subscribed on this team');
    } else {
        user.subs.push(teamID);
        ctx.reply('✅You add this team to your list of subscriptions');
    }
}

const commandForSubscribe = async (ctx, message) => {
    let teams = await HLTV.getTeamRanking();
    let search = teams.find(team => {
        if (team.team.name.split(' ')[0].toLowerCase() == message.split(' ')[1].toLowerCase()) return team;
    })
    if (search == undefined) ctx.reply('We can`t find this team😥');
    else subFunc(ctx, search);
}

const commandForDelSubscribe = (ctx) => {
    let user = USERS_SUBSCRIPTIONS.find(user => {
        if (user.userID == ctx.message.from.id) return user;
    });
    if (user) user.subs = [];
    ctx.reply('Your list of subscriptions is empty .  .  .😥');
}

async function CheckOnSub(ctx) {
    let findMatches = [];
    let user = USERS_SUBSCRIPTIONS.find(user => {
        if (user.userID == ctx.message.from.id) return user;
    });
    if (user) {
        let today = new Date().getDate();
        let matches = await (await HLTV.getMatches()).filter(ThisDay);
        user.subs.forEach(element => {
            let res = matches.find(match => {
                if (today == new Date(match.date).getDate() && (match.team1.id == element || match.team2.id == element)) return match;
            });
            if (res != undefined) findMatches.push(res);
        });
    }
    if (findMatches.length != 0) {
        let now = Date.parse(new Date());
        findMatches.forEach(element => {
            let dif = Math.round((element.date - now) / 60000);
            if (dif <= 30) ctx.reply(`🌀  🌀  🌀\nMatch: ${element.team1.name} vs ${element.team2.name} will start in ${dif} minutes\n🍿  🍿  🍿`);
        });
    }
}

function GetSubscriptionsToLogs() {
    console.log('SUBSCRIPTIONS LIST:');
    console.log(USERS_SUBSCRIPTIONS);
}


module.exports = {
    matchfunc,
    eventsfunc,
    playersfunc,
    teamsfunc,
    queryInlineForPlayer,
    commandForSubscribe,
    commandForDelSubscribe,
    onCallbackQuery,
};