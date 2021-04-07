import cheerio from 'cheerio';
import { createHmac } from 'crypto';

const hash = (data: {}): string => {
	const hmac = createHmac('sha256', '')
	hmac.update(JSON.stringify(data))
	return hmac.digest('base64')
}

type Entry = {
	name: string,
	price: string,
	items: string[],
}

type Section = {
	name: string,
	entries: Entry[],
}

export class Menu {
	readonly date: string
	readonly hash: string

	private readonly menu: Section[] = []
	private readonly $: cheerio.Root

	constructor(page: string) {
		this.$ = cheerio.load(page)
		this.date = this.$('body').text().match(/Menu du jour\ ?: (\w+ \w+ \w+)/)?.[1] ?? 'unknown date'

		this.section('Entrées')
		this.entry('Les soupes Veggy')
		this.entry('Les cakes veggy')
		this.entry('Le zandwich chô', (nodes) => nodes.last().next().text())
		this.entry('Les salades veggy ou pas')
		this.section('Plats')
		this.entry('Les plats veggy ou pas')
		this.entry('Le Grosso (gros zandwich)')
		this.section('Desserts')
		this.entry('Les entremets', (nodes) => nodes.last().prev().text())
		this.entry('Les cakes sucrés', (nodes) => {
			const price = nodes.last().closest('[data-testid=inline-content]').parent().next().text()
			const text = nodes.last().parent().text()
			return price + text
		})

		this.hash = hash(this.toJson())
	}

	entry(name: string, iterator?: (nodes: cheerio.Cheerio) => string) {
		const nodes = this.$('div').filter((_index, element) => this.$(element).text().includes(name))

		const entry = iterator?.(nodes) || nodes.last().parent().text()
		this.menu[this.menu.length - 1].entries.push(this.parseEntry(entry, name))
	}

	section(name: string) {
		this.menu.push({ name, entries: [] })
	}

	toJson() {
		return this.menu
	}

	private parseEntry(entry: string, name: string): Entry {
		const [price, ...items] = entry.replace(name, '').replace(/\n\n/g, ' ').replace(/- /g, '\n').split('\n')

		return {
			name,
			price: price.trim(),
			items: items.map((item) => item.trim().replace(/ ?-$/, '')),
		}
	}
}
