import { validate, events, licenses, getLicense } from "../utils";
import * as p from "@clack/prompts";
import c from "picocolors";

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
						{ label: c.yellow("Python"), value: "py" },
						{ label: c.blue("TypeScript"), value: "ts" },
						{ label: c.dim("JavaScript"), value: "", hint: "I wouldn't" },
					],
				}),
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

	if (opts.install) {
		const s = p.spinner();
		s.start("Cooking some things up...");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		s.stop("Done!");
	}

	p.note(
		`cd ${opts.name}        \n${
			opts.install ? "" : "pnpm install\n"
		}pnpm run start ...`,
		"Next steps:",
	);

	p.note(await getLicense(opts.license), "License:");
	p.outro(`You're all done, ${c.bgGreen(opts.name)} is ready to go! 🎉`);
}
