import c from "picocolors";
import path from "path";
import fs from "fs";
import * as p from "@clack/prompts";

export function isFolderEmpty(root: string): boolean {
	const name = path.basename(root);

	const validFiles = [
		".DS_Store",
		".git",
		".gitattributes",
		".gitignore",
		".gitlab-ci.yml",
		".hg",
		".hgcheck",
		".hgignore",
		".idea",
		".npmignore",
		".travis.yml",
		"LICENSE",
		"Thumbs.db",
		"docs",
		"mkdocs.yml",
		"npm-debug.log",
		"yarn-debug.log",
		"yarn-error.log",
		"yarnrc.yml",
		".yarn",
	];

	const conflicts = fs
		.readdirSync(root)
		.filter((file) => !validFiles.includes(file))
		// Support IntelliJ IDEA-based editors
		.filter((file) => !/\.iml$/.test(file));

	if (conflicts.length > 0) {
		const message = `The directory ${c.inverse(
			name,
		)} contains files that could conflict...\n\n${conflicts
			.map((file) => `  ${file}`)
			.join(
				"\n",
			)}\n\nEither try using a new directory name, or remove the files listed above.`;

		p.note(message, "Error:");
		return false;
	}

	return true;
}
