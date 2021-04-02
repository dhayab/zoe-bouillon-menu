//@ts-check

require('dotenv').config()
const { readFileSync, writeFileSync } = require('fs')
const superagent = require('superagent')

/** @type {{
 * hash: string,
 * date: string,
 * menu: Array<{ name: string, entries: Array<{ name: string, price: string, items: string[] }> }>
 * }} */
let MenuApi

const STORE_PATH = `${process.cwd()}/.store`
const MENU_API_URL = 'https://zoe-bouillon-menu.vercel.app/api/menu'
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
const TELEGRAM_API_ROOT = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

let FORCE_PUBLICATION = !!process.env.FORCE_PUBLICATION

/**
 * @param {MenuApi} menu
 * @returns string
 */
function format({ date, menu: sections }) {
	/** @param {string} str */
	const encode = (str) => str.replace(/./g, (c) => c.charCodeAt(0) < 127 || ['_*[]()~`>#+-=|{}.!'].includes(c) ? `\\${c}` : c)

	return sections.reduce((menu, section) =>
		section.entries.reduce((section, entry) =>
			entry.items.reduce((entry, item) =>
				`\n${entry}\\- ${encode(item)}\n`,
			`${section}\n*${encode(entry.name)}* : ${encode(entry.price)}\n`),
		`${menu}\n__${section.name}__\n`),
	`*Menu du ${date}*\n`)
}

/**
 * @param {MenuApi} menu
 * @returns boolean
 */
function updated(menu) {
	let updated = false

	try {
		updated = readFileSync(STORE_PATH, { encoding: 'utf8' }) !== menu.hash
	} catch (_) {}

	writeFileSync(STORE_PATH, menu.hash, { encoding: 'utf-8' })
	return updated
}

async function tick() {
	console.log(`\ntick [${new Date().toISOString()}]`)
	const menu = (await superagent.get(MENU_API_URL)).body

	if (!updated(menu) && !FORCE_PUBLICATION) {
		console.log('> menu not updated')
		return
	}

	console.log('> menu updated, sending to telegram...')
	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		parse_mode: 'MarkdownV2',
		text: format(menu),
	}

	try {
		const request = await superagent.get(`${TELEGRAM_API_ROOT}/sendMessage`)
			.query(payload)

		if (request.body.ok) {
			console.log('> success')
		}
	} catch (_) {
		console.log(`> an error occurred: ${_.message}`)
	}

	FORCE_PUBLICATION = false
}

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
	throw Error('Environment variables are missing.')
}

tick()
