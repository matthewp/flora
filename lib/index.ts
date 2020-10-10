import { Readable } from "stream";
import isStream from "is-stream";

import pipeInto from "./util/pipe-into";
import toString from "./util/to-string";

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

exports.html = function (strings: TemplateStringsArray, ...values: any[]) {
	let reading = false;

	let readable = new Readable({
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
};

exports.map = require("./map").map;
