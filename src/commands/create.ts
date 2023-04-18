import { validate, events, licenses, getLicense, tools } from "../utils";
import * as p from "@clack/prompts";
import c from "picocolors";
import fs from "fs";
import { isFolderEmpty } from "../helpers/is-folder-empty";
import path from "path";

export async function create() {
	console.clear();
	p.intro(c.bgCyan(c.black(" create-didit-repo ")));

	const opts = await p.group(
		{
			name: () =>
				p.text({
					message: "What's the name of your project?",
					placeholder: "my-awesome-project",
					validate: validate.notEmpty,
				}),
			languages: () =>
				p.multiselect({
					message: "What languages do you (plan to) use?",
					initialValues: ["rs", "ts"],
					required: true,
					options: [
						{ label: c.red("Rust"), value: "rs" },
						{ label: c.blue("TypeScript"), value: "ts" },
						{ label: c.dim("JavaScript"), value: "", hint: "I wouldn't" },
					],
				}),
			tooling: ({ results }) =>
				results.languages?.includes("ts") || results.languages?.includes("js")
					? p.select({
							message: "What tooling do you want to use?",
							initialValue: "rome",
							options: tools.ts,
					  })
					: undefined,
			license: () =>
				p.select({
					message: "What license do you want to use?",
					initialValue: "MIT",
					options: licenses,
				}),
			git: ({ results }) =>
				p.confirm({
					message: `Start a git repository for ${c.bold(results.name)}?`,
					initialValue: true,
				}),
			install: () =>
				p.confirm({
					message: "Install dependencies?",
					initialValue: false,
				}),
		},
		{ onCancel: events.exit },
	);

	const s = p.spinner();
	s.start("Cooking some things up...");

	// Get the project root
	const root = path.resolve(opts.name);

	// Create the project root
	fs.mkdirSync(root, { recursive: true });
	!isFolderEmpty(root) && events.cancel("Folder is not empty! :/");

	// Write license
	const license = await getLicense(opts.license);
	fs.writeFileSync(path.join(root, "LICENSE"), license);

	// Move the /templates/core/**/* to the project root
	const core = path.join(__dirname, "..", "templates", "core");
	copyRecursiveSync(core, root);

	s.stop("Done!");

	// ! Outro / Finish the CLI
	p.note(
		`cd ${opts.name}        ${opts.install ? "" : "\npnpm install"}`,
		"Next steps:",
	);

	p.outro(`You're all done, ${c.bgGreen(opts.name)} is ready to go! 🎉`);
}

/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
const copyRecursiveSync = function (src: string, dest: string) {
	const exists = fs.existsSync(src);
	const stats = (exists && fs.statSync(src)) as fs.Stats;
	const isDirectory = exists && stats.isDirectory();

	if (isDirectory) {
		fs.mkdirSync(dest);
		fs.readdirSync(src).forEach(function (childItemName) {
			copyRecursiveSync(
				path.join(src, childItemName),
				path.join(dest, childItemName),
			);
		});
	} else {
		fs.copyFileSync(src, dest);
	}
};
