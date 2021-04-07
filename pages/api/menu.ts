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
	return new Menu(page)
}

export default async (_req: NextApiRequest, res: NextApiResponse<MenuApi>) => {
	const menu = await getMenu()

	res.status(200).send({
		hash: menu.hash,
		date: menu.date,
		menu: menu.toJson()
	})
}
