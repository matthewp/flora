import arrayToStream from "stream-array";
import isStream from "is-stream";
import { Transform, Writable, Readable } from "stream";
import ExtendedReadable from "./extended-readable";

export function mapStream(
	stream: Readable,
	cb: (data: any) => Renderable | Promise<Renderable>
) {
	let outStream = new Transform();
	outStream._transform = function (val, enc, next) {
		next(null, val);
	};

	let writable = new Writable({
		objectMode: true,
		async write(data, enc, next) {
			let val = cb(data);
			if ((val as { then?: Function }).then) {
				val = await val;
			}
			if (isStream(val)) {
				val.pipe(outStream, { end: false });
				val.on("error", next);
				val.on("end", () => next(null));
			} else {
				outStream.write((await val).toString(), "utf-8", () => {
					next(null);
				});
			}
		},
	});

	writable.on("finish", () => {
		outStream.end();
	});

	stream.pipe(writable, { end: true });

	return outStream;
}

type Renderable = string | number | ExtendedReadable;

export function map<T>(
	listLike: T[],
	cb: (data: T) => Renderable | Promise<Renderable>
) {
	var list = arrayToStream(listLike);
	return mapStream(list, cb);
}
