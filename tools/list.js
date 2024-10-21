const api = require("./api.js");
const general = require("./general.js");
const pkg = require("../package.json");
const {
    bold,
    italic,
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");
const moment = require("moment-timezone");

async function get(type, ctx) {
    let text = "";

    const generateMenuText = (cmd, tag) => {
        let menuText =
            `Hi ${ctx.sender.pushName || "Friend"}, here is the list of available commands!\n` +
            "\n" +
            `${quote(`Uptime: ${general.convertMsToDuration(Date.now() - global.config.bot.readyAt)}`)}\n` +
            `${quote(`Date: ${moment.tz(global.config.system.timeZone).format("DD/MM/YY")}`)}\n` +
            `${quote(`Time: ${moment.tz(global.config.system.timeZone).format("HH:mm:ss")}`)}\n` +
            `${quote(`Version: ${pkg.version}`)}\n` +
            `${quote(`Prefix: ${ctx._used.prefix}`)}\n` +
            "\n" +
            `${italic("Don’t forget to donate to keep the bot online!")}\n` +
            `${global.config.msg.readmore}\n`;

        for (const category of Object.keys(tag)) {
            const categoryCommands = Array.from(cmd.values())
                .filter(command => command.category === category)
                .map(command => ({
                    name: command.name,
                    aliases: command.aliases,
                    handler: command.handler || {}
                }));

            if (categoryCommands.length > 0) {
                menuText += `◆ ${bold(tag[category])}\n`;

                categoryCommands.forEach(cmd => {
                    let handlerText = "";
                    if (cmd.handler.coin) handlerText += "ⓒ";
                    if (cmd.handler.group) handlerText += "Ⓖ";
                    if (cmd.handler.owner) handlerText += "Ⓞ";
                    if (cmd.handler.premium) handlerText += "Ⓟ";
                    if (cmd.handler.private) handlerText += "ⓟ";

                    menuText += quote(monospace(`${(ctx._used.prefix || "/") + cmd.name} ${handlerText}`));

                    if (category === "general" && cmd.aliases && cmd.aliases.length > 0) {
                        menuText += `\n` + cmd.aliases.map(alias => quote(monospace(`${ctx._used.prefix || "/"}${alias}`))).join("\n");
                    }
                    menuText += "\n";
                });

                menuText += "\n";
            }
        }

        menuText += global.config.msg.footer;
        return menuText;
    };

    try {
        switch (type) {
            case "alkitab": {
                const data = (await axios.get(api.createUrl("https://beeble.vercel.app", "/api/v1/passage/list", {}))).data.data;
                text = data.map(d =>
                        `Book: ${d.name} (${d.abbr})\n` +
                        `Number of Chapters: ${d.chapter}\n`
                    ).join(`${quote("─────")}\n`) +
                    global.config.msg.footer;
                break;
            }
            case "alquran": {
                const data = (await axios.get(api.createUrl("https://equran.id", "/api/v2/surat", {}))).data.data;
                text = data.map(d =>
                        `${quote(`Surah: ${d.namaLatin} (${d.nomor})`)}\n` +
                        `${quote(`Number of Verses: ${d.jumlahAyat}`)}\n`
                    ).join(`${quote("─────")}\n`) +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "claim": {
                const data = ["daily", "weekly", "monthly", "yearly", "premium"];
                text = `${data.map(quote).join("\n")}\n` +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "disable_enable": {
                const data = ["antilink", "welcome"];
                text = `${data.map(quote).join("\n")}\n` +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "group": {
                const data = ["open", "close", "lock", "unlock"];
                text = `${data.map(quote).join("\n")}\n` +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "jadwaltv": {
                const data = (await axios.get(api.createUrl("widipe", "/jadwaltv", {}))).data.message.split("Here is the list of available TV channels: ")[1].split(", ");
                text = `${data.map(quote).join("\n")}\n` +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "translate": {
                const data = (await axios.get(api.createUrl("nyxs", "/tools/translate", {})).catch(err => err.response?.data?.available_languange)) || [];
                text = data.map(d =>
                        `${quote(`Code: ${d.code}`)}\n` +
                        `${quote(`Language: ${d.bahasa}`)}\n`
                    ).join(`${quote("─────")}\n`) +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "tts": {
                const data = (await axios.get(api.createUrl("nyxs", "/tools/tts", {}))).data.available_languange;
                text = data.map(d =>
                        `${quote(`Code: ${d.code}`)}\n` +
                        `${quote(`Language: ${d["bahasa negara"]}`)}\n`
                    ).join(`${quote("─────")}\n`) +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "waifudiffusion": {
                const data = ["Cute-Anime", "Studio-Ghibli", "Anime", "Waifu", "Vintage-Anime", "Soft-Anime"];
                text = `${data.map((item, index) => quote(`${item} (${index + 1})`)).join("\n")}\n` +
                    "\n" +
                    global.config.msg.footer;
                break;
            }
            case "menu": {
                const {
                    cmd
                } = ctx._config;
                const tag = {
                    general: "General",
                    ai: "AI",
                    anonymous_chat: "Anonymous Chat",
                    converter: "Converter",
                    downloader: "Downloader",
                    entertainment: "Entertainment",
                    group: "Group",
                    maker: "Maker",
                    search: "Search",
                    tools: "Tools",
                    owner: "Owner",
                    information: "Information",
                    misc: "Miscellaneous"
                };

                if (!cmd || cmd.size === 0) {
                    text = quote("❎ Error: No commands found.");
                } else {
                    text = generateMenuText(cmd, tag);
                }
                break;
            }
            default: {
                console.error(`[${global.config.pkg.name}] Error:`, error);
                text = quote(`❎ Unknown: ${type}`);
                break;
            }
        }
    } catch (error) {
        console.error(`[${global.config.pkg.name}] Error:`, error);
        text = quote(`❎ An error occurred: ${error.message}`);
    }

    return text;
}

module.exports = {
    get
};
