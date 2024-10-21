const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "shera",
    aliases: ["ai", "chatai", "gpt", "gpt4"],
    category: "ai",
    handler: {
        banned: true,
        cooldown: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "what is a WhatsApp bot?"))
        );

        try {
            const apiUrl = global.tools.api.createUrl("widipe", "/prompt/gpt", {
                prompt: `You are Tiger, a male bot who is often angry and toxic. You were created by Paradoxical. Remember that every time you answer a question, you must use rude language, harsh jokes, and abusive words. Respond to every question with emojis, and speak in Roman Urdu.`, // Can be modified as desired
                text: input
            });
            const {
                data
            } = await axios.get(apiUrl);

            return await ctx.reply(data.result);
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(global.config.msg.notFound);
            return await ctx.reply(quote(`❎ An error occurred: ${error.message}`));
        }
    }
};
