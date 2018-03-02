require('dotenv').config();
const { Bot } = require('botbuilder');
const { BotStateManager, MemoryStorage, MessageStyler, CardStyler } = require('botbuilder');
const { BotFrameworkAdapter } = require('botbuilder-services');
const { storeData } = require('./storage');

const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', adapter.listen());

function promptInput(context, user, conversation) {
    context.reply(`Here is info we know from you so far. Your name: ${user.name || 'no info'}, age: ${user.age || 'no info'}, location : ${user.location || 'no info'}, email: ${user.email || 'no info'}, social account: ${user.smedia || 'no info'}, You want to be a ${user.ment || 'no info'}`);
    if (!user.name) {
        // Prompt user for their name
        conversation.prompt = 'name';
        context.reply(`Hi. What's your name?`);
        return true;
    }
    if (!user.ment) {
        conversation.prompt = 'ment';
        const message = MessageStyler.carousel([
            CardStyler.heroCard('Mentee', ['https://raw.githubusercontent.com/in4margaret/mentobot/master/assets/mentee.jpg'], [{ title: 'Mentee', value: 'Mentee', type: 'postBack' }]),
            CardStyler.heroCard('Mentor', ['https://raw.githubusercontent.com/in4margaret/mentobot/master/assets/mentor.jpg'], [{ title: 'Mentor', value: 'Mentor', type: 'postBack' }]),
        ]);
        context.reply(message);
        return true;
    }
    if (!user.codeOfConduct) {      
        conversation.prompt = 'codeOfConduct'
        let message = MessageStyler.contentUrl('https://mentoblob.blob.core.windows.net/code/Code%20of%20conduct.docx', 'docx', 'Code Of Conduct', 'Please read Code of Conduct');
        context.reply(message);
        message = MessageStyler.suggestedActions(['yes', 'no'], 'Do you agree with code of conduct?');
        context.reply(message);
        return true;
    }
    if (!user.age) {
        conversation.prompt = 'age';
        context.reply(`What's your age?`);
        return true;
    }
    if (!user.location) {
        // Prompt user for their locationss
        conversation.prompt = 'location';
        const message = MessageStyler.carousel([
            CardStyler.heroCard('Seattle', ['https://raw.githubusercontent.com/in4margaret/mentobot/master/assets/Seattle.PNG'], [{ title: 'Choose', value: 'Seattle', type: 'postBack' }]),
            CardStyler.heroCard('Toronto', ['https://raw.githubusercontent.com/in4margaret/mentobot/master/assets/Toronto.PNG'], [{ title: 'Choose', value: 'Toronto', type: 'postBack' }]),
            CardStyler.heroCard('Boston', ['https://raw.githubusercontent.com/in4margaret/mentobot/master/assets/Boston.PNG'], [{ title: 'Choose', value: 'Boston', type: 'postBack' }]),
        ]);
        context.reply(message);
        return true;
    }
    if (!user.email) {
        // Prompt user for their phone
        conversation.prompt = 'email';
        context.reply(`What's your email?`);
        return true;
    }
    if (!user.smedia) {
        // Prompt user for their name
        conversation.prompt = 'smedia';
        context.reply(`Please shere your FB, LinkedIn, Twitter or Skype account`);
        return true;
    }
    const {conversationReference} = context;
    storeData(user, function (error) {
        bot.createContext(conversationReference, (context) => {
            if (error) {
                if(error.code === 'EntityAlreadyExists'){
                    context.reply('Someone has already registered with the same email.');
                } else {
                    context.reply('An error occured while saving your data.');
                }
            } else {
                context.reply('Thanks for your participation! ')
            }
        });

    });
    conversation.prompt = undefined;
    user.name = undefined;
    user.location = undefined;
    user.email = undefined;
    user.smedia = undefined;
    user.ment = undefined;
    return false;
}

function onInput(context) {
    if (context.request.type === 'message') {
        const conversation = context.state.conversation;
        const user = context.state.user;

        const prompt = conversation.prompt;
        if (prompt === undefined) {
            promptInput(context, user, conversation);
            return;
        } else if (prompt === 'ment') {
            // Save their answer
            const ment = context.request.text;
            user.ment = ment;
            promptInput(context, user, conversation);
        }
        else if (prompt === 'codeOfConduct') {
            // Save their answer
            const codeOfConduct = context.request.text;
            if (codeOfConduct === 'yes') {
                user.codeOfConduct = codeOfConduct;
            }
            promptInput(context, user, conversation);
        }
        else if (prompt === 'name') {
            // Save their answer
            const name = context.request.text;
            user.name = name;
            promptInput(context, user, conversation);
        } else if (prompt === 'age') {
            const age = context.request.text;
            user.age = age;
            promptInput(context, user, conversation);
        } else if (prompt === 'location') {
            // Save their answer
            const location = context.request.text;
            user.location = location;
            promptInput(context, user, conversation);
        } else if (prompt === 'email') {
            // Save their answer
            const email = context.request.text;
            user.email = email;
            promptInput(context, user, conversation);
        } else if (prompt === 'smedia') {
            // Save their answer
            const smedia = context.request.text;
            user.smedia = smedia;
            promptInput(context, user, conversation);
        }
    }
}

const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive(onInput);
