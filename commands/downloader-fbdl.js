const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const mime = require("mime-types");
const {
    ndown
} = require("nayan-media-downloader");

module.exports = {
    name: "fbdl",
    aliases: ["fb", "facebook"],
    category: "downloader",
    code: async (ctx) => {
        try {
            const handlerObj = await global.handler(ctx, {
                banned: true,
                coin: 3
            });
            if (handlerObj.status) return ctx.reply(handlerObj.message);

            const input = ctx._args.join(" ") || null;
            if (!input) {
                return ctx.reply(
                    `${global.msg.argument}\n` +
                    `Example: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`
                );
            }

            const urlRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/.*$/;
            if (!urlRegex.test(input)) {
                return ctx.reply(global.msg.urlInvalid);
            }

            const result = await ndown(input);
            if (!result.status) {
                return ctx.reply(global.msg.notFound);
            }

            return await ctx.reply({
                video: {
                    url: result.data[0].url,
                },
                mimetype: mime.contentType("mp4"),
                caption: `❖ ${bold("FB Downloader")}\n\n➲ URL: ${input}\n\n${global.msg.footer}`,
                gifPlayback: false,
            });
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    },
};