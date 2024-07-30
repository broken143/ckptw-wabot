const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const {
    youtubedl,
    youtubedlv2
} = require("@bochilteam/scraper");
const yts = require("yt-search");
const mime = require("mime-types");

module.exports = {
    name: "play",
    aliases: ["p"],
    category: "downloader",
    code: async (ctx) => {
        const {
            banned,
            coin
        } = {
            banned: true,
            coin: 3
        };
        const handlerObj = await global.handler(ctx, {
            banned,
            coin
        });
        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.join(" ") || null;
        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Example: ${monospace(`${ctx._used.prefix + ctx._used.command} hikaru utada - one last kiss`)}`
        );

        try {
            const searchRes = await yts(input);
            if (!searchRes) return ctx.reply(global.msg.notFound);

            const ytVid = searchRes.videos[0];
            await ctx.reply(
                `❖ ${bold("Play")}\n\n` +
                `➲ Judul: ${ytVid.title}\n` +
                `➲ Artis: ${ytVid.author.name}\n` +
                `➲ Durasi: ${ytVid.timestamp}\n` +
                `➲ URL: ${ytVid.url}\n\n` +
                global.msg.footer
            );

            const ytdlRes = await (async () => {
                try {
                    return await youtubedl(ytVid.url);
                } catch {
                    return await youtubedlv2(ytVid.url);
                }
            })();

            const audInfo = Object.values(ytdlRes.audio)[0];
            const audUrl = await audInfo.download();
            if (!audUrl) return ctx.reply(global.msg.notFound);

            return await ctx.reply({
                audio: {
                    url: audUrl
                },
                mimetype: mime.contentType("mp3"),
                ptt: false
            });
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};