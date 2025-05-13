import { Bot } from "grammy";
import { mainCommand } from "./handles";
import { db } from "../drizzle/db";
import { groups, members } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { accountApi, credentialApi, didApi } from "./api";
import type { CreateDIDDocResponse } from "./types/did";
import { uuid } from "drizzle-orm/gel-core";
import { randomUUIDv7 } from "bun";

// Replace this with your actual token from @BotFather
const bot = new Bot(Bun.env.BOT_TOKEN!);

// Basic command handler
bot.command("start", mainCommand.start);
// bot.command("info", mainCommand.info);
// bot.command("did", mainCommand.did);
bot.command("groups", mainCommand.groups);

bot.on("my_chat_member", async (ctx) => {
  const chat = ctx.chat
  const newStatus = ctx.myChatMember.new_chat_member.status
  const from = ctx.myChatMember.from
  const member = ctx.myChatMember.new_chat_member;

  if (chat.type === "group" || chat.type === "supergroup") {
    if (newStatus === "member" && member.user.id !== ctx.me.id) {
      const verifyMSG = await ctx.api.sendMessage(chat.id, `Verifying your access...`)
      const userId = member.user.id;
      const groupId = chat.id;
      const find = await db.query.members.findFirst({
        where: (m, { eq }) => eq(m.user_id, userId) && eq(m.group_id, groupId)
      })
      if (!find) {
        await ctx.api.banChatMember(chat.id, userId)
      } else {
        await ctx.api.approveChatJoinRequest(chat.id, userId)
        await ctx.api.editMessageText(chat.id, verifyMSG.message_id, `✅ Verified!`)
      }
    }


  }
  if (newStatus === "member" || newStatus === "administrator") {
    console.log(`✅ Bot added to group: ${chat.title} (${chat.id}) ${from.first_name} (${newStatus})`)
    const groupExists = await db.query.groups.findFirst({
      where: (groups, { eq }) => (eq(groups.id, chat.id)),
    })
    if (!groupExists) {
      await db.insert(groups).values({
        id: chat.id,
        role: newStatus,
        owner: from.id,
        username: chat.username,
        name: chat.title,
        createdAt: new Date().toISOString(),
      })
      ctx.api.sendMessage(chat.id, `👋 Hello ${from.first_name}! I'm your new group assistant. Please set me as an admin to use my features.`)
    } else {
      await db.update(groups).set({
        role: newStatus,
      }).where(eq(groups.id, chat.id))
      if (newStatus === "administrator") {
        // I'm here to help you manage the group. Now You have to create a DID for the group to issue Verifiable Credentials.
        ctx.api.sendMessage(chat.id, `Thanks for adding me as an admin! Go to the bot pv to manage groups.`, {
          reply_markup: {
            inline_keyboard: [[
              { text: "See Groups", url: `https://t.me/${ctx.me.username}?start=groups` }
            ]]
          }
        })
      } else {
        ctx.api.sendMessage(chat.id, `I'm not administrator in this group, so I can't help you manage it. Please set me as an admin to use my features.`)
      }

    }


  } else if (newStatus === "left" || newStatus === "kicked") {
    console.log(`🚪 Bot removed from group: ${chat.title} (${chat.id})`)

    await db.delete(groups)
      .where(eq(groups.id, chat.id))
    ctx.api.sendMessage(from.id, `I was removed from the group "${chat.title}". If you want me back, just add me again!`)
  }

})


bot.on("callback_query:data", async (ctx) => {
  const [action, value] = ctx.callbackQuery.data.split(":")
  const userId = ctx.from.id
  if (action === "invite") {
    await ctx.answerCallbackQuery(); // Acknowledge the callback
    const group = await db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.id, Number(value))
    })
    await ctx.api.sendMessage(userId, `Send this link to the users who you want to join *${group?.name}*\\: \n\n \` https://t.me/${ctx.me.username}?start=${value} \` `, { parse_mode: "MarkdownV2" })
  }
  if (action === "did") {
    await ctx.answerCallbackQuery(); // Acknowledge the callback
    const loadingMessage = await ctx.reply("⏳ Loading...");

    const group = await db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.id, Number(value))
    })
    if (!group) {
      return await ctx.api.editMessageText(
        ctx.chat!.id,
        loadingMessage.message_id,
        "❌ Group not found"
      );
    }

    let didDoc: CreateDIDDocResponse = group.did_doc ? JSON.parse(group.did_doc) : null
    if (group.did) {
      return await ctx.api.editMessageText(
        ctx.chat!.id,
        loadingMessage.message_id,
        "❌ DID already created"
      );
    }
    if (group.owner !== userId) {
      return await ctx.api.editMessageText(
        ctx.chat!.id,
        loadingMessage.message_id,
        "❌ Only group owner can create DID"
      );
    }
    if (!didDoc) {
      try {
        const _didDoc = await didApi.createDIDDoc()
        const id = Number(value)
        console.log({ id })
        await db.update(groups).set({ did_doc: JSON.stringify(_didDoc) }).where(eq(groups.id, Number(value)))
        didDoc = _didDoc
      } catch (error) {
        return await ctx.api.editMessageText(
          ctx.chat!.id,
          loadingMessage.message_id,
          "❌ Unable to create DID Doc"
        );
      }
    }

    console.log({ didDoc })
    // Create did
    const did = await didApi.createDID(didDoc.didDoc)
    await db.update(groups).set({ did }).where(eq(groups.id, Number(value)))
    await ctx.api.editMessageText(
      ctx.chat!.id,
      loadingMessage.message_id,
      "✅ Success!"
    );


  }

  if (action === "verify") {
    await ctx.answerCallbackQuery()
    const msg = await ctx.reply("⏳ Issue Credential for you ...");
    const [groupId, userId] = value!.split("*")
    const group = await db.query.groups.findFirst({
      where: (g, { eq }) => eq(g.id, Number(groupId))
    })
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, Number(userId))
    })
    if (!group || !user) {
      return await ctx.api.editMessageText(
        ctx.chat!.id,
        msg.message_id,
        "❌ Group or user not found"
      );
    }

    const credential = await credentialApi.createCredential({
      issuerDid: group.did!,
      subjectDid: user.key!,
      groupId: groupId!,
      userId: userId!
    })
    db.insert(members).values({
      id: randomUUIDv7(),
      username: JSON.stringify(credential),
      group_id: Number(groupId),
      user_id: Number(userId),
      role: "member",
      createdAt: new Date().toISOString(),
    }).then(async () => {
      ctx.api.editMessageText(
        ctx.chat!.id,
        msg.message_id,
        `✅ Credential issued for ${group.name} group chat \n\n `
      );
      // await ctx.api.approveChatJoinRequest(groupId!, Number(userId));
      // console.log(`User ${userId} approved to join group ${groupId}`);

      const inviteLink = await ctx.api.createChatInviteLink(groupId!, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      });

      await ctx.api.sendMessage(userId!, `Join the group using this link: ${inviteLink.invite_link}`);
    }).catch((err) => {
      console.log("Error inserting member", err)
      ctx.api.editMessageText(
        ctx.chat!.id,
        msg.message_id,
        "❌ Error inserting member"
      );
    })
  }
})

// Handle plain messages
// bot.on("message:text", (ctx) => {
//   ctx.reply(`You said: ${ctx.message.text}`,
//     {
//       reply_markup: {
//         inline_keyboard: [[
//           { text: "Click Me", web_app: { url: "https://google.com" } },
//         ]]
//       }
//     }
//   );
// });

bot.catch((err) => {
  console.error("Error in bot:", err);
})
// Start the bot
bot.start();
console.log("Bot is running...");
