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
	const core = path.resolve("./src/templates/core");
	await copyDir(core, root, opts);

	s.stop("Done!");

	// ! Outro / Finish the CLI
	p.note(
		`cd ${opts.name}        ${opts.install ? "" : "\npnpm install"}`,
		"Next steps:",
	);

	p.outro(`You're all done, ${c.bgGreen(opts.name)} is ready to go! 🎉`);
}

import { promises } from "fs";

async function copyDir(
	src: string,
	dest: string,
	opts: {
		name: string;
		license: string;
	},
) {
	const entries = await promises.readdir(src, { withFileTypes: true });

	try {
		await promises.mkdir(dest);
	} catch (_) {}

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath, opts);
		} else {
			await promises.copyFile(srcPath, destPath);
			const exeptions = [
				"package.json",
				"Cargo.toml",
				"README.md",
				"docker-compose.yml",
			];

			if (exeptions.includes(entry.name)) {
				const content = fs.readFileSync(destPath, "utf8");
				let newContent = content.replace(/{{\s*NAME\s*}}/g, opts.name);
				newContent = newContent.replace(/{{\s*LICENSE\s*}}/g, opts.license);

				fs.writeFileSync(destPath, newContent);
			}
		}
	}
}
