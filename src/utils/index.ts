import * as p from "@clack/prompts";
import c from "picocolors";

export const validate = {
	notEmpty: (value: string) =>
		((!value || value.length < 1) && "Please choose a valid value.") ||
		undefined,
};

export const events = {
	cancel: (message: string) => {
		p.cancel(c.red(message));
		process.exit(1);
	},
	exit: () => {
		p.cancel(c.red("Okay, bye!"));
		process.exit(1);
	},
};

export const licenses = [
	{
		label: "MIT",
		hint: "Permissive",
		value: "https://api.github.com/licenses/mit",
	},
	{
		label: "AGPL-3.0",
		hint: "Copyleft",
		value: "https://api.github.com/licenses/agpl-3.0",
	},
	{
		label: "Apache-2.0",
		hint: "Copyleft",
		value: "https://api.github.com/licenses/apache-2.0",
	},
	{
		label: "Unlicense",
		hint: "Public Domain",
		value: "https://api.github.com/licenses/unlicense",
	},
];

export const getLicense = async (URL: string) =>
	String((await (await fetch(URL)).json()).body);

export const tools = {
	ts: [
		{
			label: "Rome",
			value: "rome",
			hint: "Newer, faster & unified! ✨",
		},
		{
			label: "Prettier & ESLint",
			value: "prettier-eslint",
			hint: "Broader support, but slower... 🐌",
		},
	],
};
