//---------------------------------------------
//           EMPIRE-MD - PANEL COMMANDS
//---------------------------------------------
const config = require('../config');
const { cmd, commands } = require('../lib');
const crypto = require("crypto");
const axios = require("axios");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const myNumber = "2348078582627";
const myJid = `${myNumber}@s.whatsapp.net`;

const apikey1 = 'ptla_vOaBemyGlWGR2v9RyqnUje99qmU2FbmXC0KmyMexLu5'; // PTERODACTYL ADMIN API KEY
const capikey1 = 'ptlc_rYRdfqdTDkvaODpaDIoqIEnBBFBlJr1nElw5Q1iEiSq'; // CLIENT API KEY (for resource fetch)
const domain1 = 'https://pterodactyl.empiretech.biz.id'; // PANEL DOMAIN

const nestid1 = 5; // NODEJS NEST
const egg1 = 15; // YOUR EGG ID
const loc1 = 1; // SERVER LOCATION ID

// ==================== PANEL COMMANDS ====================

cmd({
    pattern: "listserver",
    desc: "Lists all servers from the Pterodactyl panel",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (sender !== myJid) return reply('❌ Restricted command!');

    try {
        let allServers = [];
        let page = 1;
        let totalPages = 1;

        do {
            const response = await fetch(`${domain1}/api/application/servers?page=${page}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apikey1}`
                }
            });
            const res = await response.json();
            if (!res.data) break;

            allServers.push(...res.data);
            totalPages = res.meta?.pagination?.total_pages || 1;
            page++;
        } while (page <= totalPages);

        if (allServers.length === 0) return reply('No servers found');

        let messageText = '📋 *Server List*\n\n';
        for (const server of allServers) {
            const s = server.attributes;
            const resources = await fetch(`${domain1}/api/client/servers/${s.uuid.split('-')[0]}/resources`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${capikey1}`
                }
            }).then(res => res.json());

            messageText += `🔹 *${s.name}*\n` +
                         `🆔: ${s.id}\n` +
                         `💾 RAM: ${(s.limits.memory / 1024).toFixed(1)}GB\n` +
                         `⚡ CPU: ${s.limits.cpu || 'Unlimited'}%\n` +
                         `💽 Disk: ${(s.limits.disk / 1024).toFixed(1)}GB\n` +
                         `📅 Created: ${s.created_at.split('T')[0]}\n\n`;
        }

        await reply(messageText);
    } catch (e) {
        console.error(e);
        reply('❌ Error fetching server list');
    }
});

cmd({
    pattern: "createserver",
    desc: "Create a new hosting panel server",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (sender !== myJid) return reply('❌ Restricted command!');

    if (!q) return reply('Example:\n.createserver 1gb,username,email');

    const [plan, username, email] = q.split(',').map(v => v.trim().toLowerCase());
    if (!plan || !username || !email) {
        return reply('Invalid format!\nUse: .createserver plan,username,email\nExample: .createserver 1gb,testuser,test@email.com');
    }

    // Plan configuration
    const plans = {
        '1gb': { ram: 1000, disk: 1000, cpu: 40 },
        '2gb': { ram: 2000, disk: 1000, cpu: 60 },
        '3gb': { ram: 3000, disk: 2000, cpu: 80 },
        '4gb': { ram: 4000, disk: 2000, cpu: 100 },
        '5gb': { ram: 5000, disk: 3000, cpu: 120 },
        '6gb': { ram: 6000, disk: 4000, cpu: 140 },
        '7gb': { ram: 5000, disk: 5000, cpu: 160 },
        '8gb': { ram: 5000, disk: 6000, cpu: 180 },
        '9gb': { ram: 5000, disk: 7000, cpu: 200 },
        '10gb': { ram: 5000, disk: 8000, cpu: 220 },
        'unlimited': { ram: 0, disk: 0, cpu: 0 }
    };

    const selectedPlan = plans[plan] || plans['1gb'];
    const password = username + crypto.randomBytes(2).toString('hex');

    try {
        // Create user
        const userRes = await fetch(`${domain1}/api/application/users`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apikey1}`
            },
            body: JSON.stringify({
                email,
                username,
                first_name: `${username}'s Server`,
                last_name: 'Server',
                password
            })
        });
        const userData = await userRes.json();
        if (userData.errors) throw userData.errors[0].detail;

        // Get egg details
        const eggRes = await fetch(`${domain1}/api/application/nests/${nestid1}/eggs/${egg1}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apikey1}`
            }
        });
        const eggData = await eggRes.json();

        // Create server
        const serverRes = await fetch(`${domain1}/api/application/servers`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apikey1}`
            },
            body: JSON.stringify({
    name: `${username}'s Server`,
    user: userData.attributes.id,
    egg: egg1,
    docker_image: 'ghcr.io/parkervcp/yolks:nodejs_23',
    startup: eggData.attributes.startup,
    environment: {
        INST: 'npm',
        USER_UPLOAD: '0',
        AUTO_UPDATE: '0',
        CMD_RUN: 'npm start'
    },
    limits: {
        memory: selectedPlan.ram,
        swap: 0,
        disk: selectedPlan.disk,
        io: 500,
        cpu: selectedPlan.cpu
    },
    feature_limits: {
        databases: 5,
        backups: 5,
        allocations: 5
    },
    deploy: {
        locations: [loc1],
        dedicated_ip: false,
        port_range: []
                }
            })
        });
        const serverData = await serverRes.json();
        if (serverData.errors) throw serverData.errors[0].detail;

        reply(`✅ Server created successfully!\n\n` +
             `📝 *Details*\n` +
             `🔹 Username: ${username}\n` +
             `🔐 Password: ${password}\n` +
             `💾 RAM: ${selectedPlan.ram ? (selectedPlan.ram/1000)+'GB' : 'Unlimited'}\n` +
             `⚡ CPU: ${selectedPlan.cpu || 'Unlimited'}%\n` +
             `🌐 Panel: ${domain1}`);
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});

cmd({
    pattern: "delpanel",
    desc: "Delete a server from panel",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (sender !== myJid) return reply('❌ Restricted command!');

    if (!q) return reply('Please provide server ID\nExample: .delpanel 12');

    try {
        const res = await fetch(`${domain1}/api/application/servers/${q}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apikey1}`
            }
        });

        if (res.status === 204) {
            reply(`✅ Server ${q} deleted successfully`);
        } else {
            const error = await res.json();
            throw error.errors[0].detail;
        }
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});

// ==================== UTILITY COMMANDS ====================

cmd({
    pattern: "panelinfo",
    desc: "Show panel information",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (sender !== myJid) return reply('❌ Restricted command!');

    const info = `🖥️ *Panel Information*\n\n` +
                `🔹 Domain: ${domain1}\n` +
                `🔑 API Key: ${apikey1.slice(0, 10)}...\n` +
                `📦 Default Nest: ${nestid1}\n` +
                `🥚 Default Egg: ${egg1}\n` +
                `📍 Location: ${loc1}`;

    await reply(info);
});

cmd({
    pattern: "suspend",
    desc: "Suspend a server",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (sender !== myJid) return reply("❌ Restricted command!");

    if (!q) return reply("Usage:\n.suspend <server_id>");

    try {
        const res = await fetch(`${domain1}/api/application/servers/${q}/suspend`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${apikey1}`
            }
        });

        if (res.status === 204) {
            reply(`✅ Server *${q}* has been suspended successfully.`);
        } else {
            const data = await res.json();
            reply(`❌ Failed: ${data.errors?.[0]?.detail || "Unknown error"}`);
        }
    } catch (err) {
        reply(`❌ Error: ${err.message}`);
    }
});

cmd({
    pattern: "unsuspend",
    desc: "Unsuspend a server",
    category: "panel",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (sender !== myJid) return reply("❌ Restricted command!");

    if (!q) return reply("Usage:\n.unsuspend <server_id>");

    try {
        const res = await fetch(`${domain1}/api/application/servers/${q}/unsuspend`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${apikey1}`
            }
        });

        if (res.status === 204) {
            reply(`✅ Server *${q}* has been unsuspended successfully.`);
        } else {
            const data = await res.json();
            reply(`❌ Failed: ${data.errors?.[0]?.detail || "Unknown error"}`);
        }
    } catch (err) {
        reply(`❌ Error: ${err.message}`);
    }
});