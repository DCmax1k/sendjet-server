const {Expo} = require('expo-server-sdk');
let expo = new Expo();


const sendPushNoti = async messages => { // Messages is an array of message objects including keys: to: PushTok, sound: default, body: message, data: {};

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {

        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);

          } catch (error) {
            console.error(error);
          }
        }
      })();
}

module.exports = sendPushNoti;