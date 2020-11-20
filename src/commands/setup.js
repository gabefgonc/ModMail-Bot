const { MessageEmbed } = require('discord.js')
const { prefix } = require('../../config.json')
const firebase = require('firebase')
const db = firebase.database()

module.exports = {
	name: 'setup',
  aliases: ['config', 'configurar'],
	async execute(message, args) {
    const embed = new MessageEmbed()

    if(message.channel.type === "dm") {
      embed
      .setColor('RED')
      .setDescription('Esse comando só pode ser executado em um servidor.')
      return message.channel.send(embed)
    }

    if(!message.member.hasPermission('MANAGE_GUILD')) {
      embed
      .setColor('RED')
      .setDescription('Esse comando só pode ser executado por alguém que tenha a permissão de gerenciar servidor.')
      return message.channel.send(embed)
    }

    if(!args[0]) {
      const channel = (await db.ref(`guilds/${message.guild.id}/canal`).once('value')).val()
      const canal = message.guild.channels.cache.get(channel)
      const canalAtual = []

      if(canal) canalAtual.push(canal)
      else canalAtual.push('Nenhum')

      embed
      .setColor('BLUE')
      .setTimestamp()
      .setTitle('Setup')
      .setDescription(`**Como funciona:** você escolherá um canal onde será enviado os mails.
      Todos os mails criador pelos usuários via DM (Direct Message) serão enviados no canal que você definiu.
      E cabe as pessoas que tem acesso de ver aquele canal, aceitar ou rejeitar o ticket.
      Caso o ticket seja rejeitado, nada acontece, caso seja aceito, iniciará a conversa via mail.
      
      **Como configurar:** Para configurar um canal, use **${prefix}setup #canal**.
      caso você queria que esse canal seja o canal de mails, use **${prefix}setup this**

      **Exemplo:** ${prefix}setup #mails || ${prefix}setup this
      
      **Canal atual:** ${canalAtual}`)

      return message.channel.send(embed)
    }

    const newChannel = message.mentions.channels.first()

    if(args[0] && args[0].toLowerCase() === 'this') {
      db.ref(`guilds/${message.guild.id}/canal`).set(message.channel.id)

      const channel = (await db.ref(`guilds/${message.guild.id}/canal`).once('value')).val()
      const canal = message.guild.channels.cache.get(channel)

      embed
      .setColor('GREEN')
      .setTitle('Setup configurado')
      .setDescription(`${canal} foi configurado para receber os mails.`)
      .setTimestamp()

      return message.channel.send(embed)
    }

    if(args[0] && newChannel) {
      db.ref(`guilds/${message.guild.id}/canal`).set(newChannel.id)

      const channel = (await db.ref(`guilds/${message.guild.id}/canal`).once('value')).val()
      const canal = message.guild.channels.cache.get(channel)

      embed
      .setColor('GREEN')
      .setTitle('Setup configurado')
      .setDescription(`${canal} foi configurado para receber os mails.`)
      .setTimestamp()

      message.channel.send(embed)

      embed
      .setDescription(`Esse canal foi configurado para receber os mails.`)

      canal.send(embed)
    }
	}
}
