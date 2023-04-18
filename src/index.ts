import { program } from "commander";
import * as p from "@clack/prompts";
import c from "picocolors";

import { create } from "./commands/create";

const main = async () => {
	program.parse();

	switch (program.args[0]) {
		case "create":
			await create();
			break;
		default:
			p.cancel(c.red("Unknown command :("));
			process.exit(1);
	}
};

main().catch(console.error);
