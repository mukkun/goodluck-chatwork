const ELEM = {
  TIMELINE: '#_timeLine',
  SECTION: '._message',
  TIME: '._timeStamp',
  USER: '._speakerName',
  ROOMNAME: '.chatRoomHeader__roomTitle'
}
const SLACK_CHANNEL = 'cw_bk'

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request !== 'glcw') { return false }

  const spaceName = $(ELEM.ROOMNAME).text()
  let csv = [
    ['ts', 'team', 'user', 'text']
  ]
  let cacheUser = ''

  $(ELEM.TIMELINE).find(ELEM.SECTION).each((idx, elem) => {
    let field = []

    // TimeStamp
    if ($(elem).find(ELEM.TIME).length > 0) {
      const _timestamp = $(elem).find(ELEM.TIME).attr('data-tm')

      field.push(_timestamp)
    } else {
      field.push('')
    }

    // Channel
    field.push(SLACK_CHANNEL)

    // User
    if ($(elem).find(ELEM.USER).length > 0) {
      const _user = $(elem).find(ELEM.USER).text()

      if (_user !== '') {
        field.push(_user)
        cacheUser = _user
      } else {
        field.push(cacheUser)
      }
    } else {
      field.push(cacheUser)
    }

    // text
    const _text = $(elem).find('pre').text().replace(/(\r\n|\n|\r)/g, "")
    
    field.push(_text)

    csv.push(field)
  })

  chrome.runtime.sendMessage({ csv: csv, channel: spaceName },
    function(response) {
      
    }
  )
})