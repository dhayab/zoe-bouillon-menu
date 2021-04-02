import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

import { getMenu, MenuApi } from './api/menu';

const Home: NextPage<MenuApi> = ({ date, menu }) => {
	return (
		<div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
			<Head>
				<title>Zoé Bouillon • Menu du {date}</title>
			</Head>
			<main className="m-4 p-6 space-y-4 bg-white dark:text-gray-200 dark:bg-gray-800 rounded-lg shadow-lg">
				<h1 className="pb-2 text-2xl text-center border-b border-gray-200 dark:border-gray-600">{date}</h1>
				{menu.map((section) =>
					<section className="space-y-2" key={section.name}>
						<h2 className="text-xl font-bold">{section.name}</h2>
						{section.entries.map((entry) =>
							<article key={entry.name}>
								<h3 className="text-md font-semibold">
									{entry.name}
									<span className="ml-1 font-normal text-gray-600 dark:text-gray-400">{entry.price}</span>
								</h3>
								<ul className="list-disc list-inside text-sm">
									{entry.items.map((item) => <li key={item}>{item}</li>)}
								</ul>
							</article>
						)}
					</section>
				)}
			</main>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps<MenuApi> = async () => {
	const menu = await getMenu()
	return {
		props: {
			hash: menu.hash,
			date: menu.date,
			menu: menu.toJson(),
		},
	}
}

export default Home
