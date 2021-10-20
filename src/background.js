chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, 'glcw')
})

// res
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.csv)

    let csvData = 'data:text/csv;charset=utf-8,' + request.csv.map(e => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvData)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `[CW]_${request.channel}_(${request.csv.length}).csv`)
    document.body.appendChild(link)
    link.click()
  }
)