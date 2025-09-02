import { Telegraf } from 'telegraf';
import { CONFIG } from './config.js';

export const bot = new Telegraf(CONFIG.botToken);
