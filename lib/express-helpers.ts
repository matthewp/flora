import { Response } from "express";
import { Readable } from "stream";

export function streamResponse(
	stream: Readable,
	res: Response,
	type = "text/html; charset=utf-8"
) {
	res.setHeader("Content-Type", type);
	res.setHeader("Transfer-Encoding", "chunked");
	stream.on("data", (data: any) => res.write(data));
	stream.on("end", () => res.end());
}
