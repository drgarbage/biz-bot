"use strict";
const linebot = require('linebot');
const dotenv = require('dotenv');
const express = require('express');
const { companyInfo } = require('./lib/api-base');

dotenv.config();
const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET, LIFF_URL, PORT } = process.env;

// 假設您有 LINE Bot 的 Channel Access Token 和 Channel Secret
const bot = linebot({
  channelId: 'YOUR_CHANNEL_ID',
  channelSecret: CHANNEL_SECRET,
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
});

const onText = (event) => {
  switch(event.message.text){
    case "設定":
      {
        const message = {
          type: 'template',
          altText: '設定您的公司資訊',
          template: {
            type: 'buttons',
            title: '設定',
            text: '點擊按鈕開啟公司設定',
            actions: [
              {
                type: 'uri',
                label: '設定',
                uri: LIFF_URL + '/setup', 
              }
            ]
          }
        };
        event.reply(message);
      }
      break;
    case "開發票":
      {
        const message = {
          type: 'template',
          altText: '開立新發票',
          template: {
            type: 'buttons',
            title: '開發票',
            text: '點擊按鈕填寫發票資料',
            actions: [
              {
                type: 'uri',
                label: '開發票',
                uri: LIFF_URL + '?page=invoice', 
              }
            ]
          }
        };
        event.reply(message);
      }
      break;
    default:
      {
        const message = {
          type: 'flex',
          altText: '會計小幫手',
          contents: {
            "type": "bubble",
            "hero": {
              "type": "image",
              "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "action": {
                "type": "uri",
                "uri": "http://linecorp.com/"
              }
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "會計小幫手",
                  "weight": "bold",
                  "size": "xl"
                },
                {
                  "type": "text",
                  "text": "尚未完成設定"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "link",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "設定",
                    "uri": LIFF_URL + '/setup'
                  }
                },
                {
                  "type": "button",
                  "style": "link",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "開發票",
                    "uri": LIFF_URL + '/invoices/create'
                  }
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [],
                  "margin": "sm"
                }
              ],
              "flex": 0
            }
          }
        };
        event.reply(message);
      }
      break;
  }
}

bot.on('message', async function (event) {
  if(event.message.type == 'text')
    onText(event);
});

const app = express();
const linebotParser = bot.parser();
const allowCrossDomain = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Security-Policy', "img-src 'self'");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, ngrok-skip-browser-warning');
  next();
};
app.post('/linewebhook', linebotParser);
app.options('/company/:ban', allowCrossDomain, (req, res) => {
  res.status(200).end();
});
app.get('/company/:ban', allowCrossDomain, async (req, res) => {
  res.json(await companyInfo(req.params.ban));
});
app.get('/', (req, res) => { res.send("Service is Running") });
app.listen(PORT, console.info(`Server running at ${PORT}`));