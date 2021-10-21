const ELEM = {
  TIMELINE: '#_timeLine',
  SECTION: '._message',
  TIME: '._timeStamp',
  USER: '._speakerName',
  ROOMNAME: '.chatRoomHeader__roomTitle',
  MEMBERS: '#_memberDetailMember',
  MEMBERSDIR: '#_memberDetailButton'
}
const SLACK_CHANNEL = 'cw_bk'

let HOST_URL = document.location.href.replace(/https?:\/\/([^/]+).+rid([\d]+)/, '$1')
let target_room_id = document.location.href.replace(/https?:\/\/([^/]+).+rid([\d]+)/, '$2')
let target_chat_id = $(ELEM.TIMELINE).find(ELEM.SECTION).last().attr('id').substr(10)
const LIMIT_COUNT = 10000
const INTERVAL_TIME = 100

let message_logs = []

function log(room_id, first_chat_id, count, callback)
{
  if (count <= 0)
  {
    callback();
    return;
  }
  const token = ACCESS_TOKEN
  const myid = MYID
  const url = `https://${HOST_URL}/gateway/load_old_chat.php?myid=${myid}&_v=1.80a&_av=5&ln=ja&room_id=${room_id}&first_chat_id=${first_chat_id}`
  const request = new XMLHttpRequest()
  request.open('POST', url);
  request.onreadystatechange = function (){
    if (request.readyState != 4) {
      // リクエスト中
    } else if (request.status != 200) {
      // 失敗
    } else {
      const text = request.responseText
      const json = JSON.parse(text)
      const chat_list = json['result']['chat_list']
      if (chat_list.length === 0)
      {
        callback();
        return
      }
      const chat_messages = chat_list.filter(item => item['msg'] != null)
      chat_messages.forEach(item => {
        message_logs.push(item)
      })
      const last_chat_id = (chat_list[chat_list.length - 1]['id'])
      setTimeout(() =>
      {
        log(room_id, last_chat_id, count - 1, callback)
      }, INTERVAL_TIME)
    }
  };

  const formData = new FormData()
  formData.append('pdata', '{"_t":"' + token + '"}')
  request.send(formData)
}

const callback = function()
{
  message_logs.sort((a, b) => {
    return Number(a["id"]) - Number(b["id"])
  })

  let members = []
  let csv = [
    ['ts', 'team', 'user', 'text']
  ]

  // Get Member
  $(ELEM.MEMBERS).find('.roomMemberTable').each(function(idx, val) {
    const self = $(val).find('.roomMemberTable__nameText').children()
    
    const name = $(self).text()
    const aid = $(self).attr('class').substr(8)

    members.push({
      aid: aid,
      name: name
    })
  })

  // Set Csv
  $.each(message_logs, function(idx, val) {
    let field = []

    // TimeStamp
    field.push(`"${val.tm}"`)

    // Team
    field.push(`"${SLACK_CHANNEL}"`)

    // User
    let findUserId = 0
    $.each(members, function(i, v) {
      if (v.aid == val.aid) {
        field.push(`"${v.name}"`)
        findUserId = v.id
      }
    })

    // ユーザーが見つからない場合
    if (findUserId === 0) {
      field.push(`"${val.aid}"`)
    } else {
      findUserId = 0
    }

    // Text
    field.push(`"${val.msg}"`)
    
    csv.push(field)
  })

  let csvData = 'data:text/csv;charset=utf-8,' + csv.map(e => e.join(',')).join('\n')

  const encodedUri = encodeURI(csvData)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `[CW]_${$(ELEM.ROOMNAME).text()}_(${csv.length}).csv`)
  document.body.appendChild(link)
  link.click()

  console.log(csv)
};

$(ELEM.MEMBERSDIR).click()
log(target_room_id, target_chat_id, LIMIT_COUNT, callback)
