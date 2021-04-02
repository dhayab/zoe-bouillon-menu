import type { NextApiRequest, NextApiResponse } from 'next';
import { Menu } from '../../utils/menu';

export type MenuApi = {
	hash: string,
	date: string,
	menu: ReturnType<Menu['toJson']>,
}

const URL = 'https://www.zoebouillon.fr'

export const getMenu = async () => {
	const page = await (await fetch(URL)).text()
	const menu = new Menu(page)

	menu.section('Entrées')
	menu.entry('Les soupes Veggy')
	menu.entry('Les cakes veggy')
	menu.entry('Le zandwich chô', (nodes) => nodes.last().next().text())
	menu.entry('Les salades veggy ou pas')
	menu.section('Plats')
	menu.entry('Les plats veggy ou pas')
	menu.entry('Le Grosso (gros zandwich)')
	menu.section('Desserts')
	menu.entry('Les entremets', (nodes) => nodes.last().prev().text())
	menu.entry('Les cakes sucrés', (nodes) => {
		const price = nodes.last().closest('[data-testid=inline-content]').parent().next().text()
		const text = nodes.last().parent().text()
		return price + text
	})

	return menu
}

export default async (_req: NextApiRequest, res: NextApiResponse<MenuApi>) => {
	const menu = await getMenu()

	res.status(200).send({
		hash: menu.hash,
		date: menu.date,
		menu: menu.toJson()
	})
}
