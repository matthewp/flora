import { Writable, Readable } from "stream";

export default function pipeInto(fromStream: Readable, readable: Readable) {
	let outStream = fromStream.pipe(
		new Writable({
			write(data, _, next) {
				readable.push(data);
				next(null);
			},
		})
	);

	return new Promise((resolve) => {
		outStream.on("finish", () => resolve());
	});
}
