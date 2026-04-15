import { Bot, Context, session, SessionFlavor } from 'grammy';
import {
  conversations,
  createConversation,
  type ConversationFlavor,
} from '@grammyjs/conversations';
import { botConfig } from './config';
import { supabase } from './services/supabase';
import { startHandler } from './handlers/start';
import { nhansuHandler } from './handlers/nhansu';
import { addNhansuConversation } from './conversations/nhansu';

// Define session interface
export interface SessionData {
  step: 'idle' | string;
  context: 'idle' | string;
}

export type MyContext = ConversationFlavor<Context & SessionFlavor<SessionData>>;

export const bot = new Bot<MyContext>(botConfig.telegramBotToken);

// Persistent Session Middleware using Supabase
bot.use(session({
  initial: (): SessionData => ({ step: 'idle', context: 'idle' }),
  storage: {
    read: async (key) => {
      const { data } = await supabase
        .from('bot_sessions')
        .select('data')
        .eq('id', key)
        .single();
      return data?.data;
    },
    write: async (key, value) => {
      await supabase.from('bot_sessions').upsert({
        id: key,
        data: value,
        updated_at: new Date().toISOString()
      });
    },
    delete: async (key) => {
      await supabase.from('bot_sessions').delete().eq('id', key);
    }
  }
}));

// Install Conversations Plugin
bot.use(conversations());
bot.use(createConversation(addNhansuConversation, 'addNhansu'));

// Basic Error Handling
bot.catch((err) => {
  console.error(`Error while handling update ${err.ctx.update.update_id}:`);
  console.error(err.error);
});

// Register Handlers
bot.use(startHandler);
bot.use(nhansuHandler);
