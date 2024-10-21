const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");

function generateInstruction(actions, mediaTypes) {
    if (!actions || !actions.length) {
        throw new Error("Necessary actions must be specified.");
    }

    let translatedMediaTypes;
    if (typeof mediaTypes === "string") {
        translatedMediaTypes = [mediaTypes];
    } else if (Array.isArray(mediaTypes)) {
        translatedMediaTypes = mediaTypes;
    } else {
        throw new Error("Media type must be a string or an array of strings.");
    }

    const mediaTypeTranslations = {
        "audio": "audio",
        "contact": "contact",
        "document": "document",
        "gif": "GIF",
        "image": "image",
        "liveLocation": "live location",
        "location": "location",
        "payment": "payment",
        "poll": "poll",
        "product": "product",
        "ptt": "voice message",
        "reaction": "reaction",
        "sticker": "sticker",
        "templateMessage": "template message",
        "text": "text",
        "video": "video",
        "viewOnce": "view once"
    };

    const translatedMediaTypeList = translatedMediaTypes.map(type => mediaTypeTranslations[type]);

    let mediaTypesList;
    if (translatedMediaTypeList.length > 1) {
        const lastMediaType = translatedMediaTypeList[translatedMediaTypeList.length - 1];
        mediaTypesList = translatedMediaTypeList.slice(0, -1).join(", ") + `, or ${lastMediaType}`;
    } else {
        mediaTypesList = translatedMediaTypeList[0];
    }

    const actionTranslations = {
        "send": "Send",
        "reply": "Reply"
    };

    const instructions = actions.map(action => `${actionTranslations[action]}`);
    const actionList = instructions.join(actions.length > 1 ? " or " : "");

    return `📌 ${actionList} ${mediaTypesList}!`;
}

function generateCommandExample(command, args) {
    if (!command) {
        throw new Error("A command must be provided.");
    }

    if (!args) {
        throw new Error("Arguments must be provided.");
    }

    const commandMessage = `Example: ${monospace(`${command} ${args}`)}`;
    return commandMessage;
}

function generatesFlagInformation(flags) {
    if (typeof flags !== "object" || !flags) {
        throw new Error("Flags must be provided as an object.");
    }

    const flagInfo = "Flag:\n" +
        Object.entries(flags).map(([flag, description]) =>
            quote(`• ${monospace(flag)}: ${description}`)
        ).join("\n");

    return flagInfo;
}

function generateNotes(notes) {
    if (!Array.isArray(notes)) {
        throw new Error("Notes must be an array of strings.");
    }

    const notesInfo = "Notes:\n" +
        notes.map(note =>
            quote(`• ${note}`)
        ).join("\n");

    return notesInfo;
}

module.exports = {
    generateInstruction,
    generateCommandExample,
    generatesFlagInformation,
    generateNotes
};
