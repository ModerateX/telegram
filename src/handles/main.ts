import type { CommandContext, Context } from "grammy";
import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import type { InlineKeyboardButton } from "grammy/types";
import { keyApi } from "../api";
import { createKey } from "../api/key";


export const start = async (ctx: CommandContext<Context>) => {

  const text = ctx.message?.text.split(" ")
  const payload = text?.length === 2 ? text[1] : undefined
  const _user = ctx.from
  console.log({ text, groupId: payload })
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, Number(_user?.id))
  })

  if (!user && _user) {

    const creatingKey = await ctx.reply("⏳ Creating a Key for you ...");
    const key = await keyApi.createKey()
    await db.insert(users).values({
      id: _user.id,
      key: key,
      username: _user.username,
      firstName: _user.first_name,
      lastName: _user.last_name,
      createdAt: new Date().toISOString(),
    })
    await ctx.api.editMessageText(
      ctx.chat!.id,
      creatingKey.message_id,
      `✅ Success, your identity key\\: \n 
\` ${key} \`
`,
      { parse_mode: "MarkdownV2" }
    );
  }
  if (payload === "start") return
  if (payload === "groups") {
    groups(ctx)
    return
  }

  if (!payload) {


    await ctx.reply(`👋 Hello ${_user?.first_name}!

This bot helps you manage private group access and verify members before joining.
You can add me to a group and protect it using the button below.`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "➕ Add to Group",
              url: `https://t.me/${ctx.me.username}?startgroup=start`
            }
          ]]
        }
      })
    return
  }

  const group = await db.query.groups.findFirst({
    where: (g, { eq }) => eq(g.id, Number(payload))
  })


  console.log({ group })
  // // Store pending verification with group context
  // await db.insert(joinRequests).values({
  //   userId: ctx.from.id,
  //   groupId: group.id,
  //   approved: 0,
  //   timestamp: new Date().toISOString()
  // }).onConflictDoNothing()

  await ctx.reply(`👋 You're about to join "${group?.name}" group chat.
Please tap below to verify.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Verify Me", callback_data: `verify:${group?.id}*${_user?.id}` }
        ]]
      }
    })
}



// export const info = async (ctx: CommandContext<Context>) => {
//
//   const chat = ctx.chat
//
//   if (chat.type === "group" || chat.type === "supergroup") {
//     const group = await db.query.groups.findFirst({ where: (g, { eq }) => eq(g.id, chat.id) })
//     await ctx.reply(`Group Info: \n\n Name: ${group?.name} \n DID: ${group?.did} \n My Role: ${group?.role} \n Owner: ${group?.owner} \n Added At: ${group?.createdAt} \n\n Use /start to add me to a group.`)
//   } else {
//     await ctx.reply(` use this command in a group chat`)
//   }
// }

// export const did = async (ctx: CommandContext<Context>) => {
//
//   const chat = ctx.chat
//
//   if (chat.type === "group" || chat.type === "supergroup") {
//     const group = await db.query.groups.findFirst({ where: (g, { eq }) => eq(g.id, chat.id) })
//     if (!group) return ctx.reply(`Group not found!`)
//     if (group?.owner !== ctx.from?.id) return ctx.reply(`Only the group owner can manage DID.`)
//     if (group.did) return ctx.reply(`DID already exists: ${group.did}`)
//     await ctx.reply(`Creating DID for group "${group.name}"...`, {
//       reply_markup: {
//         inline_keyboard: [[
//           { text: "Create DID", callback_data: `did:${chat.id}` }
//         ]]
//       }
//     })
//   } else {
//     await ctx.reply(` use this command in a group chat`)
//   }
// }

export const groups = async (ctx: CommandContext<Context>) => {

  const chat = ctx.chat
  const user = ctx.from

  if (chat.type === "group" || chat.type === "supergroup") {
    return await ctx.reply(` use this command in bot pv`)
  }

  const groups = await db.query.groups.findMany({ where: (g, { eq }) => eq(g.owner, user?.id!) })
  if (!groups) return ctx.reply(`Groups not found!`)
  for (const group of groups) {
    const inline_keyboard: InlineKeyboardButton[][] = []
    if (!group.did) {
      inline_keyboard.push(
        [{ text: "Create DID", callback_data: `did:${group.id}` }]
      )
    }
    if (group.role === "administrator" && group.did) {
      inline_keyboard.push(
        [{ text: "Manage Group", callback_data: `group:${group.id}` }],
        [{ text: "Get Invite Link", callback_data: `invite:${group.id}` }],
      )
    }
    await ctx.reply(`Name: ${group.name} \n DID: ${group.did} \n My Role: ${group.role} \n Owner: ${group.owner} \n Added At: ${group.createdAt} \n\n`,
      {
        reply_markup: {
          resize_keyboard: true,
          inline_keyboard: [...inline_keyboard]
        }
      }
    )
    await ctx.reply(`Add me to new group!`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "➕ Add to Group",
            url: `https://t.me/${ctx.me.username}?startgroup=start`
          }
        ]]
      }
    })
  }
}
