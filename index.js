const { WebSocket } = require('ws')
const cron = require('node-cron')
const axios = require('axios')

const DOMAIN = 'misskey.art'
const API_BASEURL = `https://${DOMAIN}/`
const WS_BASEURL = API_BASEURL.replace('http', 'ws')

const TOKEN = 'FH8yRKeuug0WJ1ez54UmIo3vklgKwmtJ'

const buchuArray = [
  'ぶちゅ',
  'ぶちゅぶちゅ',
  'ぶちゅーーーー',
  'ぶちゅちゅ',
  'しゅぶぶぶぶ',
  'ぶちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅちゅ',
  'ベイクドぶちゅぶちゅ',
  '😍💋',
  '💋💋',
  '😘',
  '💋',
]
const ws = new WebSocket(WS_BASEURL + 'streaming?i=' + TOKEN)
ws.on('error', console.error)

ws.on('open', function open() {
  //ws.send('something')
  console.log('Realtime Stream Connected!')
  ws.send(
    JSON.stringify({
      type: 'connect',
      body: {
        channel: 'main',
        id: 'main',
      },
    }),
  )
  ws.send(
    JSON.stringify({
      type: 'connect',
      body: {
        channel: 'homeTimeline',
        id: 'home',
      },
    }),
  )
})

ws.on('message', function message(data) {
  console.log(JSON.parse(data))
  const jsonData = JSON.parse(data)
  if (
    jsonData.body.type === 'notification' &&
    jsonData.body.body.type === 'follow'
  ) {
    const followedUsername = jsonData.body.body.user.username
    console.log('Got follow by: ' + followedUsername)
    console.log('Follow backing...')
    axios
      .post(API_BASEURL + 'api/following/create', {
        i: TOKEN,
        userId: jsonData.body.body.userId,
      })
      .then(() => {
        console.log('Follow Success!')
      })
      .catch((error) => {
        console.log(
          `Follow Failed: ${error.response.status} ${error.response.statusText}`,
        )
      })
  }
  if (jsonData.body.type === 'note' && jsonData.body.body.id) {
    console.log('Got new note')
    console.log('Subscribing...')
    ws.send(
      JSON.stringify({
        type: 'subNote',
        body: {
          id: jsonData.body.body.id,
        },
      }),
    )
  }
})

cron.schedule('0/10 0 * * * *', () => {
  const buchuRandom = buchuArray[Math.floor(Math.random() * buchuArray.length)]
  console.log('Posting buchu...')
  axios
    .post(API_BASEURL + 'api/notes/create', {
      i: TOKEN,
      text: buchuRandom,
      visibility: 'public',
      localOnly: true,
    })
    .then(() => {
      console.log('Buchuing success!')
    })
    .catch((error) => {
      console.log(
        `Buchu post Failed: ${error.response.status} ${error.response.statusText}`,
      )
    })
})
