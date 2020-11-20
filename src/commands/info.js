const Discord = require('discord.js')
const bot = new Discord.Client()
const { token } = require('../../config.json')

module.exports = {
	name: 'bot',
  aliases: ['info', 'botinfo'],
	execute(message) {
    const owner = bot.users.cache.get('389866221295763456')
    const programer = bot.users.cache.get('596035072818282498')
    const administrator = bot.users.cache.get('449240801520779266')

    const embed = new Discord.MessageEmbed()
    .setColor('BLUE')
    .setTimestamp()
    .addFields(
      { name: 'Criador', value: owner.tag, inline: true },
      { name: 'Programador', value: programer.tag, inline: true },
      { name: 'Administrador', value: administrator.tag, inline: true },
      { name: 'Servidores', value: bot.guilds.cache.size, inline: true },
      { name: 'Usuários', value: bot.users.cache.size, inline: true },
      { name: 'Canais', value: bot.channels.cache.size, inline: true },
      { name: 'Ping API', value: `${Math.floor(bot.ws.ping)}ms`, inline: true },
      { name: 'Latência', value: `${Date.now() - message.createdTimestamp}ms`, inline: true }
    )
    .setTitle('Informações')

    message.channel.send(embed)
	}
}

bot.login(token)