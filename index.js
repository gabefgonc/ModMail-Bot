const Discord = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const config = require('./config.json')
const firebase = require('./src/utils/database/data')

const bot = new Discord.Client()
bot.commands = new Discord.Collection()

const commandFile = readdirSync(join(__dirname, "src", "commands")).filter((file) => file.endsWith('.js'))

for(const file of commandFile) {
	const commands = require(join(__dirname, "src", "commands", `${file}`))
	bot.commands.set(commands.name, commands)
}

bot.on('ready', () => {
	console.log(`${bot.user.tag} carregado com sucesso.`)
})

bot.on('message', async message => {
	if(message.author.bot) return;

	var prefix = config.prefix;

	if(!message.content.startsWith(prefix)) return;

	if(message.content.startsWith(`<@${bot.user.id}>`) || message.content.startsWith(`<@!${bot.user.id}`)) {
		const embed = new Discord.MessageEmbed()
		.setColor('BLUE')
		.setTitle(`Olá, ${message.author.username}`)
		.setDescription(`Olá ${message.author.username}, sou **${bot.user.username}**, um simples bot
		para o Discord com o intuito de ajudar com o suporte do seu servidor.
		Caso você tenha qualquer dúvida sobre minhas funções, você pode 
		entrar no meu servidor de suporte [clicando aqui](https://www.google.com), vamos começar!
		Para saber todos os meus comandos, digite \`${prefix}ajuda\`.
		Para saber como configurar seu servidor, digite \`${prefix}setup\`.`)
		.setTimestamp()

		message.channel.send(embed)
	}

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command =
		bot.commands.get(commandName) ||
		bot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
		
	if(!command) return;

	try {
		command.execute(message, args)
	} catch(err) {
		console.log(err)
	}
})

bot.login(config.token)