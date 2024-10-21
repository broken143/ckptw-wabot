const {
    ButtonBuilder,
    Client,
    CommandHandler,
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const {
    Events,
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const {
    S_WHATSAPP_NET
} = require("@whiskeysockets/baileys");
const {
    exec
} = require("child_process");
const path = require("path");
const {
    inspect
} = require("util");

// Connection message
console.log(`[${global.config.pkg.name}] Connecting...`);

// Create a new bot instance
const bot = new Client({
    WAVersion: [2, 3000, 1015901307],
    phoneNumber: global.config.bot.phoneNumber,
    prefix: global.config.bot.prefix,
    readIncommingMsg: global.config.system.autoRead,
    printQRInTerminal: !global.config.system.usePairingCode,
    selfReply: global.config.system.selfReply,
    usePairingCode: global.config.system.usePairingCode
});

// Event handler when the bot is ready
bot.ev.once(Events.ClientReady, async (m) => {
    console.log(`[${global.config.pkg.name}] Ready at ${m.user.id}`);

    // Set global.config to the bot
    await Promise.all([
        global.config.bot.number = m.user.id.split(/[:@]/)[0],
        global.config.bot.id = m.user.id.split(/[:@]/)[0] + S_WHATSAPP_NET,
        global.config.bot.readyAt = bot.readyAt
    ]);
});

// Create a command handler and load commands
const cmd = new CommandHandler(bot, path.resolve(__dirname, "commands"));
cmd.load();

// Event handler when a message appears
bot.ev.on(Events.MessagesUpsert, async (m, ctx) => {
    const isGroup = ctx.isGroup();
    const isPrivate = !isGroup;
    const senderJid = ctx.sender.jid;
    const senderNumber = senderJid.split(/[:@]/)[0];
    const groupJid = isGroup ? ctx.id : null;
    const groupNumber = isGroup ? groupJid.split("@")[0] : null;

    // Log incoming messages
    if (isGroup) {
        console.log(`[${global.config.pkg.name}] Incoming message from group: ${groupNumber}, by: ${senderNumber}`);
    } else {
        console.log(`[${global.config.pkg.name}] Incoming message from: ${senderNumber}`);
    }


    // Command handler
    const isCmd = global.tools.general.isCmd(m, ctx);
    if (isCmd) {
        await global.db.set(`user.${senderNumber}.lastUse`, Date.now());
        if (global.config.system.autoTypingOnCmd) ctx.simulateTyping(); // Auto-typing simulation for commands

        const mean = isCmd.didyoumean;
        if (mean) {
            const prefix = isCmd.prefix;
            const input = isCmd.input;

            if (global.config.system.useInteractiveMessage) {
                let button = new ButtonBuilder()
                    
                    .setDisplayText("✅ Yes!")
                    .setType("quick_reply").build();

                await ctx.replyInteractiveMessage({
                    body: quote(`❓ Did you mean}?`),
                    footer: global.config.msg.watermark,
                    nativeFlowMessage: {
                        buttons: [button]
                    }
                });
            } else if (!global.config.system.useInteractiveMessage) {
                await ctx.reply(quote(`❓ Did you mean?`));
            }
        }

        // The XP and leveling-up feature has been removed from this section
    }

    // Owner-specific commands
    if (global.tools.general.isOwner(ctx, senderNumber, true)) {
        // Eval command: Execute JavaScript code
        if (m.content && m.content.startsWith && (m.content.startsWith("==> ") || m.content.startsWith("=> "))) {
            const code = m.content.startsWith("==> ") ? m.content.slice(4) : m.content.slice(3);

            try {
                const result = await eval(m.content.startsWith("==> ") ? `(async () => { ${code} })()` : code);

                await ctx.reply(inspect(result));
            } catch (error) {
                console.error(`[${global.config.pkg.name}] Error:`, error);
                await ctx.reply(quote(`❎ An error occurred: ${error.message}`));
            }
        }

        // Exec command: Run shell command
        if (m.content && m.content.startsWith && m.content.startsWith("$ ")) {
            const command = m.content.slice(2);

            try {
                const output = await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(new Error(`Error: ${error.message}`));
                        } else if (stderr) {
                            reject(new Error(stderr));
                        } else {
                            resolve(stdout);
                        }
                    });
                });

                await ctx.reply(output);
            } catch (error) {
                console.error(`[${global.config.pkg.name}] Error:`, error);
                await ctx.reply(quote(`❎ An error occurred: ${error.message}`));
            }
        }
    }

    // AFK handler: Mentioned user
    const mentionJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentionJids && mentionJids.length > 0) {
        for (const mentionJid of mentionJids) {
            const getAFKMention = global.db.get(`user.${mentionJid.split(/[:@]/)[0]}.afk`);
            if (getAFKMention) {
                const [reason, timeStamp] = await Promise.all([
                    global.db.get(`user.${mentionJid.split(/[:@]/)[0]}.afk.reason`),
                    global.db.get(`user.${mentionJid.split(/[:@]/)[0]}.afk.timeStamp`)
                ]);
                const timeAgo = global.tools.general.convertMsToDuration(Date.now() - timeStamp);

                await ctx.reply(quote(`📴 They are AFK for ${reason} for ${timeAgo}.`));
            }
        }
    }

    // AFK handler: Returning from AFK
    const getAFKMessage = await global.db.get(`user.${senderNumber}.afk`);
    if (getAFKMessage) {
        const [reason, timeStamp] = await Promise.all([
            global.db.get(`user.${senderNumber}.afk.reason`),
            global.db.get(`user.${senderNumber}.afk.timeStamp`)
        ]);

        const currentTime = Date.now();
        const timeElapsed = currentTime - timeStamp;

        if (timeElapsed > 3000) {
            const timeAgo = global.tools.general.convertMsToDuration(timeElapsed);
            await global.db.delete(`user.${senderNumber}.afk`);
            await ctx.reply(quote(`🎉 You are back online after being AFK for ${timeAgo}.`));
        }
    }

    // Retrieve all menfess data from the database
    const allMenfessData = Object.entries(global.db)
        .filter(([key, value]) => key.startsWith('menfess.'));

    // Iterate through all found menfess data
    for (const [conversationId, menfessData] of allMenfessData) {
        const { from, to } = menfessData;

            if (m.content && /delete|stop/i.test(m.content)) {
                const senderInConversation = senderNumber === from || senderNumber === to;

                if (senderInConversation) {
                    await global.db.delete(`menfess.${conversationId}`);

                    const targetNumber = senderNumber === from ? to : from;

                    await ctx.reply(quote("✅ Menfess message has been deleted!"));
                    await ctx.replyWithJid(targetNumber + S_WHATSAPP_NET, quote("✅ Menfess message has been deleted!"));
                }
            }

            try {
                const senderInConversation = senderNumber === from || senderNumber === to;

                if (senderInConversation) {
                    const targetId = (senderNumber === from) ? to + S_WHATSAPP_NET : from + S_WHATSAPP_NET;

                    ctx._client.sendMessage(targetId, {
                        forward: m
                    });

                    await ctx.reply(quote(`✅ Message successfully forwarded to ${targetId}!`));
                    await global.db.set(`menfess.${conversationId}.lastMsg`, Date.now());

                    break;
                }
            } catch (error) {
                console.error(`[${global.config.pkg.name}] Error:`, error);
                await ctx.reply(quote(`❎ An error occurred: ${error.message}`));
            }
        }
    }
);

// Event handling when a user joins or leaves a group
bot.ev.on(Events.UserJoin, (m) => {
    m.eventsType = "UserJoin";
    handleUserEvent(m);
});

bot.ev.on(Events.UserLeave, (m) => {
    m.eventsType = "UserLeave";
    handleUserEvent(m);
});

// Launch the bot
bot.launch().catch((error) => console.error(`[${global.config.pkg.name}] Error:`, error));

// Utility function
async function handleUserEvent(m) {
    const {
        id,
        participants
    } = m;

    try {
        const getWelcome = await global.db.get(`group.${id.split(/[:@]/)[0]}.welcome`);
        if (getWelcome) {
            const metadata = await bot.core.groupMetadata(id);

            for (const jid of participants) {
                let profilePictureUrl;
                try {
                    profilePictureUrl = await bot.core.profilePictureUrl(jid, "image");
                } catch (error) {
                    profilePictureUrl = global.config.bot.picture.profile;
                }

                const message = m.eventsType === "UserJoin" ?
                    quote(`👋 Welcome @${jid.split(/[:@]/)[0]} to the group ${metadata.subject}!`) :
                    quote(`👋 @${jid.split(/[:@]/)[0]} left the group ${metadata.subject}.`);
                const card = global.tools.api.createUrl("aggelos_007", "/welcomecard", {
                    text1: jid.split(/[:@]/)[0],
                    text2: m.eventsType === "UserJoin" ? "Welcome!" : "Goodbye!",
                    text3: metadata.subject,
                    avatar: profilePictureUrl,
                    background: global.config.bot.picture.thumbnail
                });

                await bot.core.sendMessage(id, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: global.config.bot.groupChat,
                            title: m.eventsType === "UserJoin" ? "JOIN" : "LEAVE",
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: card || profilePictureUrl || global.config.bot.picture.thumbnail,
                            sourceUrl: global.config.bot.groupChat
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error(`[${global.config.pkg.name}] Error:`, error);
        await bot.core.sendMessage(id, {
            text: quote(`❎ An error occurred: ${error.message}`)
        });
    }
}
