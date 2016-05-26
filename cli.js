var repl = require('repl');
var prettyms = require('pretty-ms');

function setupRepl(discord) {
    var replServer = repl.start("lurk> ");

    replServer.context.discord = discord;
    replServer.defineCommand('game', {
        help: 'Set the current game',
        action: (game) => {
            discord.setPlayingGame(game);
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('uptime', {
        help: 'Show uptime',
        action: () => {
            console.log('Uptime: ' + prettyms(discord.uptime));
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('get_history', {
        help: 'Get historic messages from active channels',
        action: () => {
            discord.servers.forEach((server) => {
                server.channels.forEach((channel) => {
                    if (channel.type !== "text") return;
                    discord.fetch_history(channel);
                });
            });
            replServer.displayPrompt();
        }
    });

    replServer.on("exit", () => {
        discord.logout(() => {
            console.log('Logged out');
            process.exit();
        });
    });
}

module.exports = { setupRepl: setupRepl };
