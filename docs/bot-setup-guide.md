# Discord Bot Setup Guide

This guide walks you through creating a Discord bot from scratch, obtaining a bot token, and inviting the bot to your server. No prior experience with the Discord Developer Portal is required.

---

## 1. Create a Discord Application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and sign in with your Discord account.
2. Click **New Application** in the top-right corner.
3. Enter a name for your application (this will be the default name of your bot).
4. Accept the Developer Terms of Service and click **Create**.
5. On the application's **General Information** page, note the **Application ID** -- you may need it later.

---

## 2. Create a Bot User

1. In the left sidebar, click the **Bot** tab.
2. If your application does not already have a bot user, click **Add Bot** and confirm.
3. Click **Reset Token** (or **Copy** if the token is still visible) to obtain your bot token.
4. Copy the token and store it somewhere safe. This value is your `DISCORD_TOKEN`.

**IMPORTANT:** Never share your bot token with anyone. Never commit it to version control. Anyone with your token can control your bot. If your token is ever leaked, return to this page immediately and click **Reset Token** to invalidate the old one.

---

## 3. Enable Privileged Intents

Still on the **Bot** tab, scroll down to the **Privileged Gateway Intents** section. You must enable all three intents for the bot to function correctly:

- **Presence Intent** -- Optional but recommended. Allows the bot to receive presence updates (online status, activity) for server members.
- **Server Members Intent** -- Required. Allows the bot to receive events related to server members joining, leaving, and being updated. This is necessary for member management tools.
- **Message Content Intent** -- Required. Allows the bot to read the content of messages. Without this, message content will appear empty in most cases.

Toggle all three intents **on**, then click **Save Changes** at the bottom of the page.

---

## 4. Generate an Invite Link

1. In the left sidebar, click **OAuth2**, then click **URL Generator**.
2. Under **Scopes**, select the following:
   - `bot`
   - `applications.commands`
3. A **Bot Permissions** section will appear below. Select the following permissions:

**General Permissions:**
- Manage Server
- Manage Roles
- Manage Channels
- View Audit Log
- Manage Webhooks
- Manage Events
- Manage Emojis and Stickers

**Text Channel Permissions:**
- Send Messages
- Manage Messages
- Read Message History
- Add Reactions
- Use External Emojis

**Voice Channel Permissions:**
- Move Members
- Disconnect Members

**Moderation Permissions:**
- Kick Members
- Ban Members
- Moderate Members

4. After selecting all permissions, a **Generated URL** will appear at the bottom of the page. Click **Copy**.
5. Paste the URL into your browser's address bar and press Enter.
6. In the authorization prompt, select the server you want to add the bot to from the dropdown.
7. Click **Authorize** and complete any CAPTCHA if prompted.

The bot should now appear in your server's member list (it will be offline until you run the bot).

---

## 5. Get Your Server ID

1. Open Discord (the desktop or web application).
2. Go to **User Settings** (the gear icon near the bottom-left).
3. Navigate to **Advanced** in the left sidebar.
4. Enable **Developer Mode** and close settings.
5. In the server list on the left, right-click your server's name (or icon).
6. Click **Copy Server ID**.

This value is your `DISCORD_GUILD_ID`. Save it alongside your bot token.

---

## 6. Configure the MCP Server

Create a `.env` file in the project root with the following contents:

```env
DISCORD_TOKEN=your-bot-token-here
DISCORD_GUILD_ID=your-server-id-here
```

Replace `your-bot-token-here` with the bot token you copied in Step 2, and `your-server-id-here` with the server ID you copied in Step 5.

Then build and run the server:

```bash
npm run build
npm start
```

Your bot should come online in your Discord server. If it does not, verify that your token and guild ID are correct, and that the bot was properly invited to the server in Step 4.

---

## Troubleshooting

- **Bot is offline after starting:** Double-check that `DISCORD_TOKEN` in your `.env` file matches the token from the Developer Portal. If in doubt, reset the token and update your `.env` file.
- **Bot cannot read messages:** Ensure that **Message Content Intent** is enabled in the Developer Portal (Step 3). This is a common oversight.
- **Bot cannot manage members:** Ensure that **Server Members Intent** is enabled and that the bot's role in your server is positioned above the roles it needs to manage in the server's role hierarchy.
- **Permission errors:** Make sure you selected all the required permissions when generating the invite link (Step 4). You may need to re-invite the bot with the correct permissions.
- **"Missing Access" errors for specific channels:** The bot needs the appropriate channel-level permissions. Check that the bot's role is not being overridden by channel-specific permission settings.
