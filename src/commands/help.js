const { MessageEmbed } = require('discord.js')
const mapPages = require('../utils/pages/pages')

module.exports = {
	name: 'help',
  aliases: ['ajuda'],
	async execute(message) {
    let titles = [
      'Lista de comandos',
      'Lista de comandos - DM',
      'Como abrir um ticket',
      'Suporte'
    ]

    let pages = [
      mapPages.page1,
      mapPages.page2,
      mapPages.page3,
      mapPages.page4
    ]

    let page = 1;
    let title = 1;

    const embed = new MessageEmbed()
    .setColor('BLUE')
    .setTimestamp()
    .setTitle(titles[title - 1])
    .setDescription(pages[page - 1])

    const msg = await message.channel.send(`Página **${page}** de **${pages.length}**`, embed)
    await msg.react('◀️')
		await msg.react('▶️')

		const filtroForward = (r, u) => r.emoji.name === '▶️' && u.id === message.author.id
		const coletorForward = msg.createReactionCollector(filtroForward)

		const filtroBackward = (r, u) => r.emoji.name === '◀️' && u.id === message.author.id
    const coletorBackward = msg.createReactionCollector(filtroBackward)
    
    coletorForward.on('collect', () => {
      if(page === 2) {
        embed
        .setImage('https://cdn.discordapp.com/attachments/754147268684415076/766107584448430080/exampleImage.PNG')
      } else {
        embed
        .setImage(null)
      }
			if(page === pages.length) {
        page = 1;
        title = 1;
			} else {
        page++
        title++
			}

			embed
      .setTitle(titles[title - 1])
      .setDescription(pages[page - 1])
			msg.edit(`Página **${page}** de **${pages.length}**`, embed)
		})

		coletorBackward.on('collect', () => {
      if(page === 4) {
        embed
        .setImage('https://cdn.discordapp.com/attachments/754147268684415076/766107584448430080/exampleImage.PNG')
      } else {
        embed
        .setImage(null)
      }
			if(page === 1) {
        page = pages.length;
        title = titles.length;
			} else {
        page--
        title--
			}

      embed
      .setTitle(titles[title - 1])
			.setDescription(pages[page - 1])
			msg.edit(`Página **${page}** de **${pages.length}**`, embed)
		})
	}
}