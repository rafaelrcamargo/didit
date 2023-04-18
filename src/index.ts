import PACKAGE from "../package.json";

import semver from "semver";
import { program } from "commander";

import { events } from "./utils";
import { create } from "./commands/create";

program
	.name(PACKAGE.name)
	.version(PACKAGE.version)
	.description(PACKAGE.description);

program
	.command("create")
	.description("Create a new project.")
	.option("-y, --yes");

program
	.command("release")
	.description("Release a new version of the project.")
	.argument("<level>", "The level of the release (major, minor, patch)")
	.option("-p, --pre-release <version>", "The PR tag (alpha, beta, rc)");

const main = async () => {
	program.parse();

	switch (program.args[0]) {
		case "create":
			await create();
			break;

		case "release":
			console.log({
				opts: program.commands[1]?.opts(),
				inc: semver.inc("0.0.0", "minor"),
			});
			break;

		default:
			events.cancel("Unknown command :(");
			process.exit(1);
	}
};

main().catch(console.error);
