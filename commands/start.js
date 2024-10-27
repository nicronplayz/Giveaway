const ms = require("ms");
const messages = require("../utils/message");

module.exports.run = async (client, message, args) => {
  // Permission checks
  if (
    !message.member.permissions.has("ManageMessages") &&
    !message.member.roles.cache.some(r => r.name === "Giveaways")
  ) {
    return message.reply(
      ":x: You need to have the manage messages permission or the 'Giveaways' role to start giveaways."
    );
  }

  // Giveaway channel
  let giveawayChannel = message.mentions.channels.first();
  if (!giveawayChannel) {
    return message.reply(":x: You have to mention a valid channel!");
  }

  // Giveaway duration
  let giveawayDuration = args[1];
  if (!giveawayDuration || isNaN(ms(giveawayDuration))) {
    return message.reply(":x: You have to specify a valid duration!");
  }

  // Number of winners
  let giveawayNumberWinners = parseInt(args[2]);
  if (isNaN(giveawayNumberWinners) || giveawayNumberWinners <= 0) {
    return message.reply(":x: You have to specify a valid number of winners!");
  }

  // Giveaway prize
  let giveawayPrize = args.slice(3).join(" ");
  if (!giveawayPrize) {
    return message.reply(":x: You have to specify a valid prize!");
  }

  // Optional giveaway description
  let giveawayDescription = args.slice(4).join(" ") || "No description provided.";

  // Optional entry fee
  let entryFee = parseInt(args[5]);
  if (isNaN(entryFee) || entryFee < 0) {
    entryFee = 0; // Default to free entry
  }

  // Start the giveaway
  await client.giveawaysManager.start(giveawayChannel, {
    duration: ms(giveawayDuration),
    prize: giveawayPrize,
    winnerCount: giveawayNumberWinners,
    hostedBy: client.config.hostedBy ? message.author : null,
    messages,
    description: giveawayDescription,
    entryFee: entryFee
  });

  // Reminder logic
  const reminderTime = ms("5m"); // Set reminder for 5 minutes before it ends
  setTimeout(() => {
    giveawayChannel.send(`Reminder: The giveaway for **${giveawayPrize}** will end in 5 minutes!`);
  }, ms(giveawayDuration) - reminderTime);

  message.reply(`Giveaway started in ${giveawayChannel} with ${giveawayNumberWinners} winners!`);
}
