import arrayToStream from "stream-array";
import isStream from "is-stream";
import { Transform, Writable, Readable } from "stream";

function mapStream(stream: Readable, cb: (data: any) => any) {
	let outStream = new Transform();
	outStream._transform = function (val, enc, next) {
		next(null, val);
	};

	let writable = new Writable({
		objectMode: true,
		write(data, enc, next) {
			let val = cb(data);
			if (isStream(val)) {
				val.pipe(outStream, { end: false });
				val.on("error", next);
				val.on("end", () => next(null));
			} else {
				// TODO
				throw new Error(
					"Using map with non-stream entries is not currently supported."
				);
			}
		},
	});

	writable.on("finish", () => {
		outStream.end();
	});

	stream.pipe(writable, { end: true });

	return outStream;
}

exports.mapStream = mapStream;

function map(listLike: any, cb: (data: any) => any) {
	var list = listLike;
	if (Array.isArray(listLike)) {
		list = arrayToStream(listLike);
	}
	return mapStream(list, cb);
}

exports.map = map;
