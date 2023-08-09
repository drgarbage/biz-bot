import { Client } from '@line/bot-sdk';
import { onText } from "./handlers";

const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET } = process.env;

const config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
};
const client = new Client(config);

const handleEvent = async (event) => {

  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, await onText(event));
  }

  return null;
}

export default (req, res) => {

  if(req.method === 'POST') {
    return Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result[0]))
      .catch((err)=>{
        console.error(err);
        res.status(500).end();
      });
  } else {
    res.status(500).end();
    return Promise.resolve();
  }

}