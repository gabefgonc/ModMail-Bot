const { prefix } = require('../../config.json')

exports.page1 = 
  `**${prefix}ajuda**
  Use para mostrar essa mensagem
  
  **${prefix}info**
  Use para ver informações sobre o bot
  
  **${prefix}setup**
  Use para configurar seu servidor
  
  **${prefix}close**
  Use para fechar um ticket aberto`

exports.page2 = 
  `**${prefix}list**
  Use para listar os servidores disponíveis
  
  **${prefix}create**
  Use para abrir um ticket
  
  **${prefix}close**
  Use para fechar um ticket aberto`

exports.page3 = 
  `Para abrir um ticket, você precisar enviar uma mensagem via DM
  (Direct Message) contendo **${prefix}create idDoServidor** e aguardar
  um membro do suporte do servidor aceitar seu ticket.
  
  O ID do servidor está localizado entre parênteses ao lado do nome do
  servidor ao usar **${prefix}list**. Como você pode ver a imagem a seguir.`

exports.page4 =
  `Caso você tenha alguma dúvida, sugestão ou deseja reportar algum bug, você
  pode entrar no meu servidor de suporte [clicando aqui](https://www.google.com).
  Caso você queira me adicionar ao seu servidor, [clique aqui](https://discord.com/oauth2/authorize?client_id=765727539716161536&scope=bot&permissions=268557392).`
