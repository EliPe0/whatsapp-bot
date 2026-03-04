<div align="center">

# ⏰ WhatsApp Reminder Bot

**Create and receive automatic reminders directly on WhatsApp — just by chatting!**

</div>

---

## 📖 What is this?

This is a bot that connects to your WhatsApp and lets you **schedule reminders through chat**. At the right time, it sends you a message automatically — and you can confirm, cancel, or delay it.

No extra apps. No sign-ups. Just chat. 💬

---

## ✨ What it can do

- 📌 Create reminders with a name, time, and message
- 🗑️ Delete reminders you no longer need
- 📋 List all your active reminders
- ⏰ Send you a notification at the scheduled time, every day
- ✅ Let you confirm, cancel, or delay a reminder by 30 minutes

---

## 🚀 How to run

### Requirements

- [Node.js](https://nodejs.org/) installed on your computer
- A WhatsApp account

### Steps

```bash
# 1. Clone this repository
git clone https://github.com/your-EliPe0/whatsapp-reminder-bot.git
cd whatsapp-reminder-bot

# 2. Install the dependencies
npm install

# 3. Start the bot
node index.js
```

A **QR Code** will appear in the terminal. Just scan it with WhatsApp:

> Open WhatsApp → **Linked Devices** → **Link a Device** → scan the QR code ✅

---

## 💬 Commands

Send these messages directly in WhatsApp to control the bot:

| Command | What it does |
|---|---|
| `create reminder` | 📌 Creates a new reminder |
| `delete reminder` | 🗑️ Deletes an existing reminder |
| `reminders` | 📋 Shows all active reminders |
| `help` | ❓ Shows available commands |

---

## 🔄 Example: Creating a reminder

```
You:  create reminder
Bot:  📌 What is the name of the reminder?

You:  Morning workout
Bot:  ⏰ What time? (e.g.: 08:00)

You:  07:30
Bot:  📃 What is the reminder message?

You:  Time to hit the gym! 💪
Bot:  ✅ Reminder created successfully!
```

At **07:30**, you'll receive:

```
⏰ Reminder: *Time to hit the gym! 💪*
To continue, choose an option below:

[1] Continue ✅
[2] Cancel ❌
[3] Delay 30 minutes ⏳
```

---

## ⚠️ Good to know

- Reminders repeat **every day** at the chosen time until you delete them.
- Your reminders are saved in a `reminders.json` file — they won't disappear if you restart the bot.
- This bot uses an unofficial WhatsApp integration. Use it responsibly.

---

<div align="center">

Made with ❤️ and ☕

</div>
