import { Readable } from "stream";
import isStream from "is-stream";

import pipeInto from "./util/pipe-into";
import toString from "./util/to-string";
import ExtendedReadable from "./extended-readable";

export { map } from "./map";

async function readAll(
	stream: Readable,
	strings: TemplateStringsArray,
	values: any[]
) {
	let i = 0;
	while (i < values.length) {
		let html = strings[i];
		stream.push(html);

		let p = values[i];
		let val;
		if (isStream.readable(p)) {
			await pipeInto(p, stream);
		} else {
			val = await p;
			if (isStream.readable(val)) {
				await pipeInto(val, stream);
			} else {
				stream.push(toString(val));
			}
		}

		i++;
	}
	stream.push(strings[i]);
	stream.push(null);
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
	let reading = false;

	let readable = new ExtendedReadable({
		read() {
			if (reading) return;
			reading = true;
			readAll(this, strings, values).catch((err) => {
				this.emit("error", err);
				this.push(null);
			});
		},
	});

	return readable;
}

export { streamResponse } from "./express-helpers";

export * as Elements from "./elements";
