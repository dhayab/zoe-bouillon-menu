const colors = require('tailwindcss/colors')

module.exports = {
	purge: ['./pages/**/*.tsx'],
	darkMode: 'media',
	theme: {
		extend: {
			colors: {
				gray: colors.trueGray,
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
}
