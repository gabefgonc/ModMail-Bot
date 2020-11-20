const Discord = require('discord.js')
const bot = new Discord.Client()
const { token } = require('../../config.json')

const arrayUtils = require('../utils/components/arrayManipulation')

module.exports = {
	name: 'listservers',
	aliases: ['list', 'servers', 'servidores', 'guilds'],
	async execute(message) {
		const embed = new Discord.MessageEmbed()

		if(message.channel.type === 'text') {
			embed
			.setColor('RED')
			.setDescription(`Esse comando só pode ser executado via DM (Direct Message).`)
			return message.channel.send(embed)
		}

		const servers = bot.guilds.cache.map(a => `**${a.name} (${a.id})**\nOwner: **${a.owner.user.tag}**\n`)

		var serversForPageContent = []
		var selectedPage = 1
		let page = arrayUtils.getPage(servers.length)
		var auxArray = arrayUtils.mapRawArrayAndMakeObjectArray(servers)
		var serversForPage = arrayUtils.choosePage(auxArray, selectedPage)

		function clearArray() {
			while(serversForPageContent.length > 0) {
				serversForPageContent.pop()
			}
		}

		serversForPage.map(response => {
			serversForPageContent.push(`**${response.index}.** ${response.server}`)
		})

		embed
		.setTitle('ModMail')
		.setColor('BLUE')
		.setDescription(serversForPageContent)
		.setFooter(`${servers.length} servidores disponíveis`)

		if(page === 1) {
			return message.channel.send(embed)
		}

		const msg = await message.channel.send(`Página **${selectedPage}** de **${page}**`, embed)
		await msg.react('◀️')
		await msg.react('▶️')

		const filtroForward = (r, u) => r.emoji.name === '▶️' && !u.bot
		const coletorForward = msg.createReactionCollector(filtroForward)

		const filtroBackward = (r, u) => r.emoji.name === '◀️' && !u.bot
		const coletorBackward = msg.createReactionCollector(filtroBackward)

		coletorForward.on('collect', () => {
			if(selectedPage === page) {
				selectedPage = 1;
				clearArray()
			} else {
				selectedPage++
				clearArray()
			}

			auxArray = arrayUtils.mapRawArrayAndMakeObjectArray(servers)
			serversForPage = arrayUtils.choosePage(auxArray, selectedPage)

			serversForPage.map(response => {
				serversForPageContent.push(`**${response.index}.** ${response.server}`)
			})

			embed
			.setDescription(serversForPageContent)
			msg.edit(`Página **${selectedPage}** de **${page}**`, embed)
		})

		coletorBackward.on('collect', () => {
			if(selectedPage === 1) {
				selectedPage = page;
				clearArray()
			} else {
				selectedPage--
				clearArray()
			}

			auxArray = arrayUtils.mapRawArrayAndMakeObjectArray(servers)
			serversForPage = arrayUtils.choosePage(auxArray, selectedPage)
			
			serversForPage.map(response => {
				serversForPageContent.push(`**${response.index}.** ${response.server}`)
			})

			embed
			.setDescription(serversForPageContent)
			msg.edit(`Página **${selectedPage}** de **${page}**`, embed)
		})
	}
}

bot.login(token)