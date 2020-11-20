const Discord = require('discord.js')
const bot = new Discord.Client()
const firebase = require('firebase')
const db = firebase.database()
const { token, prefix } = require('../../config.json')
const fs = require('fs')

const openedTickets = new Map()
const openedTicketsFilter = new Map()
const Messages = []

module.exports = {
	name: 'create',
  aliases: ['criar', 'ticket'],
	async execute(message, args) {
    const embed = new Discord.MessageEmbed()

    if(message.channel.type === 'text') {
			embed
			.setColor('RED')
			.setDescription(`Esse comando só pode ser executado via DM (Direct Message).`)
			return message.channel.send(embed)
    }
    
    if(!args[0]) {
      embed
      .setColor('RED')
      .setDescription(`Você deve digitar o ID localizado ao lado do nome do servidor.`)
      return message.channel.send(embed)
    }

    if(args[0]) {
      if(openedTickets.has(message.author.id)) {
        embed
        .setColor('RED')
        .setDescription(`Você já tem um convite pendente ou um ticket aberto.`)
        return message.channel.send(embed)
      }
      try {
        const fetchedGuild = await bot.guilds.fetch(args[0])
        if(fetchedGuild) {
          const channel = (await db.ref(`guilds/${fetchedGuild.id}/canal`).once('value')).val()
          const canal = fetchedGuild.channels.cache.get(channel)

          if(!canal || canal === null || canal === undefined) {
            embed
            .setColor('RED')
            .setDescription(`${fetchedGuild.name} não está recebendo mails.`)
            return message.channel.send(embed)
          }

          if(openedTicketsFilter.has(canal.id)) {
            embed
            .setColor('RED')
            .setDescription(`${fetchedGuild.name} já está atendendo outra pessoa.`)
            return message.channel.send(embed)
          }

          embed
          .setColor('BLUE')
          .setDescription(`Você tem certeza que deseja abrir um ticket em ${fetchedGuild.name}?`)
          openedTickets.set(message.author.id)

          const msgA = await message.channel.send(embed)
          await msgA.react('✅')
          await msgA.react('❌')

          const filtroYes = (r, u) => r.emoji.name === '✅' && !u.bot
          const coletorYes = msgA.createReactionCollector(filtroYes, { max: 1 })

          const filtroNo = (r, u) => r.emoji.name === '❌' && !u.bot
          const coletorNo = msgA.createReactionCollector(filtroNo, { max: 1 })

          coletorYes.on('collect', async () => {
            embed
            .setColor('GREEN')
            .setTitle('ModMail')
            .setDescription(`Sua mensagem foi enviada para ${fetchedGuild.name} com sucesso.
            Espere até que algum membro do suporte aceita seu ticket.`)

            msgA.delete()
            message.channel.send(embed)

            embed
            .setColor('BLUE')
            .setTitle('Mail recebido')
            .setTimestamp()
            .setDescription(`Um novo mail de **${message.author.tag}** foi recebido.`)

            const msg = await canal.send(embed)
            await msg.react('✅')
            await msg.react('❌')

            try {
              const reactionFilter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && !user.bot
              const reactions = await msg.awaitReactions(reactionFilter, { max: 1, time: 300000, errors: ['time'] })

              const choice = reactions.get('✅') || reactions.get('❌')

              if(choice.emoji.name === '✅') {
                msg.delete()

                embed
                .setColor('BLUE')
                .setTitle('ModMail')
                .setDescription(`O ticket foi aberto com sucesso.
                Toda mensagem enviada nesse canal será gravada e enviada.`)
                .setTimestamp(null)

                message.author.send(embed)
                canal.send(embed)
                openedTicketsFilter.set(canal.id)

                await handleCollectors(canal, message)
              }

              if(choice.emoji.name === '❌') {
                msg.delete()

                embed
                .setColor('RED')
                .setTitle('ModMail')
                .setDescription(`Seu ticket em ${fetchedGuild.name} foi rejeitado.`)
                .setTimestamp(null)

                message.author.send(embed)
                openedTickets.delete(message.author.id)
                return;
              }
            } catch(err) {
              msg.delete()
              openedTickets.delete(message.author.id)

              embed
              .setColor('RED')
              .setTitle('ModMail')
              .setDescription(`Não há ninguém disponível para aceitar seu ticket no momento.
              Por favor, tente novamente mais tarde.`)
              .setTimestamp(null)

              openedTickets.delete(message.author.id)
              return message.author.send(embed)
            }
          })

          coletorNo.on('collect', () => {
            msgA.delete()
            openedTickets.delete(message.author.id)
          })
        }
      } catch(err) {
        embed
        .setColor('RED')
        .setDescription(`Não foi possível localizar esse servidor.`)
        return message.channel.send(embed)
      } 
    } 
  }
}

function handleCollectors(canal, message) {
  const filter = m => m.author.id === message.author.id;
  const dmCollector = message.channel.createMessageCollector(filter)

  const guildCollectorFilter = m => m.channel.id === canal.id && !m.author.bot;
  const guildChannelCollector = canal.createMessageCollector(guildCollectorFilter)

  return new Promise((resolve, reject) => {
    dmCollector.on('collect', async m => {
      if(m.content.toLowerCase() === `${prefix}close`) {
        const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('ModMail')
        .setDescription(`O ticket foi fechado, estou enviando
        o arquivo com toda a conversa gravada.`)

        canal.send(embed)
        message.author.send(embed)

        await fs.writeFileSync(`../mail.txt`, Messages.join('\n'))
        canal.send(new Discord.MessageAttachment(fs.createReadStream(`../mail.txt`)))
        message.author.send(new Discord.MessageAttachment(fs.createReadStream(`../mail.txt`)))
        
        openedTickets.delete(message.author.id)
        openedTicketsFilter.delete(canal.id)
        guildChannelCollector.stop()
        dmCollector.stop()
        resolve()
      }else {
        const files = getAttachmentLinks(m.attachments)
        Messages.push(`[Usuário] ${m.author.tag}: ${m.content}`)
        canal.send(`**${m.author.tag}:** ${m.content}`, {
          files
        })
      }
    })
    guildChannelCollector.on('collect', async m => {
      if(m.content.toLowerCase() === `${prefix}close`) {
        const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('ModMail')
        .setDescription(`O ticket foi fechado, estou enviando
        o arquivo com toda a conversa gravada.`)

        canal.send(embed)
        message.author.send(embed)

        await fs.writeFileSync(`../mail.txt`, Messages.join('\n'))
        canal.send(new Discord.MessageAttachment(fs.createReadStream(`../mail.txt`)))
        message.author.send(new Discord.MessageAttachment(fs.createReadStream(`../mail.txt`)))
        
        openedTickets.delete(message.author.id)
        openedTicketsFilter.delete(canal.id)
        guildChannelCollector.stop()
        dmCollector.stop()
        resolve()
      } else {
        const files = getAttachmentLinks(m.attachments)
        Messages.push(`[Suporte] ${m.guild.name}: ${m.content}`)
        message.author.send(`**${m.guild.name}:** ${m.content}`, {
          files
        })
      }
    })
  })
}

function getAttachmentLinks(attachments) {
  const valid = /^.*(gif|png|jpg|jpeg)$/g
  return attachments.array()
  .filter(attachment => valid.test(attachment.url))
  .map(attachment => attachment.url)
}

bot.login(token)