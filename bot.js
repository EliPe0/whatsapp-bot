const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const fs = require("fs");

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("📱 | Scan the QR Code with your Whatsapp!")
});

const pendingReminders = {}
const states = {}
const tempReminder = {}

const saveReminders = () => {
    fs.writeFileSync("reminders.json", JSON.stringify(reminders));
}

const loadReminders = () => {
    if (fs.existsSync("reminders.json")) {
        const data = fs.readFileSync("reminders.json", "utf-8");
        if (data === "") return [];
        const loadedReminders = JSON.parse(data);

        return loadedReminders;
    } else {
        return [];
    }
}

const reminders = loadReminders();

const formatNumber = (destination) => {
    return destination + "@c.us"
}

const convertTime = (time) => {
    const [hour, minute] = time.split(":");
    return `0 ${minute} ${hour} * * *`;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scheduleReminder = (reminder) => {
    cron.schedule(convertTime(reminder.time), async () => {
        await client.sendMessage(reminder.destination, `⏰ Reminder: *${reminder.message}*\nTo continue, choose an option below:\n\n[1] Continue ✅\n[2] Cancel ❌\n[3] Delay 30 minutes ⏳`);

        pendingReminders[reminder.destination] = reminder;
        states[reminder.destination] = "waiting_confirmation";
    });
}

client.on("ready", async () => {
    console.log("✅ | System started!");
    reminders.forEach(reminder => {
        scheduleReminder(reminder);
    });
})

client.on("message_create", async (msg) => {   
    if (msg.fromMe) return;

    if (states[msg.from] === "waiting_name") {

        tempReminder[msg.from] = { name: msg.body };
        states[msg.from] = "waiting_time";
        await wait(2000);
        await msg.reply("⏰ What time? (e.g.: 08:00)");

    } else if (states[msg.from] === "waiting_time") {

        tempReminder[msg.from].time = msg.body;
        states[msg.from] = "waiting_message";
        await wait(2000);
        await msg.reply("📃 What is the reminder message?");

    } else if (states[msg.from] === "waiting_message") {

        tempReminder[msg.from].message = msg.body;
        tempReminder[msg.from].destination = msg.from;
        reminders.push(tempReminder[msg.from]);
        scheduleReminder(tempReminder[msg.from]);
        states[msg.from] = null;
        saveReminders();
        await wait(2000);
        await msg.reply("✅ Reminder created successfully!");

    } else if (states[msg.from] === "waiting_confirmation") {
        
        if (msg.body === "1") {
            await wait(2000);
            await msg.reply("✅ Reminder confirmed!");
        } else if (msg.body === "2") {
            await wait(2000);
            await msg.reply("❌ Reminder canceled!");
        } else if (msg.body === "3") {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            const newReminder = { ...pendingReminders[msg.from], time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}` };
            reminders.push(newReminder);
            scheduleReminder(newReminder);
            await wait(2000);
            await msg.reply("⏳ Reminder delayed 30 minutes!");
        }
        delete pendingReminders[msg.from];
        states[msg.from] = null;

    } else if (states[msg.from] === "deleting") {
        const index = parseInt(msg.body) - 1;
        if (index >= 0 && index < reminders.length) {
            const reminder = reminders[index];
            reminders.splice(index, 1);
            saveReminders();
            await wait(2000);
            await msg.reply(`🗑️ Reminder "${reminder.name}" deleted successfully!`);
        } else {
            await wait(2000);
            await msg.reply("❌ Invalid number!");
        }
        states[msg.from] = null;

    } else {

        if (msg.body.toLowerCase() === "reminders") {

            let list = "📋 My active reminders:\n\n";
            reminders.forEach(async (reminder) => {
                list += `${reminder.name} - ${reminder.time}\n`;
            })
            await wait(2000);
            await msg.reply(list);

        } else if (msg.body.toLowerCase() === "create reminder") {

            states[msg.from] = "waiting_name";
            await wait(2000);
            await msg.reply("📌 What is the name of the reminder?");

        } else if (msg.body.toLowerCase() === "delete reminder") {
            let list = "🗑️ Active reminders:\n";
            reminders.forEach(async (reminder, index) => {
                list += `${index + 1}. ${reminder.name} - ${reminder.time}\n`;
            })
            states[msg.from] = "deleting";
            await wait(2000);
            await msg.reply(list + "\nEnter the number of the reminder you want to delete.");

        } else if (msg.body.toLowerCase() === "help") {
            await wait(2000);
            await msg.reply("📋 Available commands:\n\n- Create reminder\n- Delete reminder\n- Reminders\n- Help");
        }
    }
});

client.initialize();