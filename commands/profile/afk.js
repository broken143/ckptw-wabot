const {
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "afk",
    category: "profile",
    handler: {
        banned: true,
        cooldown: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        try {
            const reason = input || "tanpa alasan";
            const senderJidDecode = await jidDecode(ctx.sender.jid);
            const senderNumber = senderJidDecode.user;
            global.db.set(`user.${senderNumber}.afk`, {
                reason: reason,
                timeStamp: Date.now()
            });

            return ctx.reply(quote(`📴 Anda sekarang akan AFK dengan alasan ${reason}.`));
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            return ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};