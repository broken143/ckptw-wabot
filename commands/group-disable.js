const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "disable",
    aliases: ["off"],
    category: "owner",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            admin: true,
            banned: true,
            botAdmin: true,
            cooldown: true,
            group: true
        });
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(`${global.tools.msg.generateInstruction(["send"], ["text"])} Bingung? Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} list`)} untuk melihat daftar.`)}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "welcome"))
        );

        if (ctx.args[0] === "list") {
            const listText = await global.tools.list.get("disable_enable");
            return ctx.reply(listText);
        }

        try {
            const groupNumber = ctx.isGroup() ? ctx.msg.key.remoteJid.split("@")[0] : null;

            switch (input) {
                case "antilink":
                    await global.db.set(`group.${groupNumber}.antilink`, false);
                    return ctx.reply(quote(`⚠ Fitur 'antilink' berhasil dinonaktifkan!`));
                case "welcome":
                    await global.db.set(`group.${groupNumber}.welcome`, false);
                    return ctx.reply(quote(`⚠ Fitur 'welcome' berhasil dinonaktifkan!`));
                default:
                    return ctx.reply(quote(`⚠ Perintah tidak valid. Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} list`)} untuk melihat daftar.`));
            }
        } catch (error) {
            console.error("[ckptw-wabot] Kesalahan:", error);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};