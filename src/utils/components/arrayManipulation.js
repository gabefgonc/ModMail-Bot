module.exports = {
   mapRawArrayAndMakeObjectArray(array) {
    let aux = 1
    let page = 1
    let serverObject = {}
    var newServers = []
    let test = array.length
  
    array.map((server) => {
      serverObject = {
        'index': aux,
        'server': server,
        'page': page
      }
      
      if(aux  % 5 === 0){
        page ++
        if(aux === test){
          page-- 
        }
      }
      newServers.push(serverObject)
      aux ++
    })
    return newServers
  },
  
   choosePage(array, page) {
    let serversForPage = []
    array.map(ns => {
      if(ns.page === page){
        serversForPage.push(ns)
      }
    })
    return serversForPage
  },

  getPage(length){
    let total = length
    let pagesRaw = total / 5
    if(total % 5 !== 0){
      pagesRaw++
    }
    return parseInt(pagesRaw)
  }
  
}