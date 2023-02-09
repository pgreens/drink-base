import { createReadStream, writeFileSync } from "fs";
import * as stream from "stream";
import { StreamParser, StreamWriter } from "n3";
import * as jsonld from "jsonld";

const parser = new StreamParser();
const writer = new StreamWriter({
  format: "N-Triples",
});
parser.pipe(writer);

const cocktails = createReadStream("./ontology/cocktail.ttl");
const bevon = createReadStream("./ontology/bevon.ttl");

const readIter = concatStreams([cocktails, bevon]);
const combined = stream.Readable.from(readIter);

combined.pipe(parser);

streamToString(writer).then((rdf) => {
  jsonld
    .fromRDF(rdf as any)
    .then((json) =>
      writeFileSync("./build_only/ontology.json", JSON.stringify(json))
    );
});

// adapted from StackOverflow
async function* concatStreams(readStreams: stream.Readable[]) {
  for (const readable of readStreams) {
    for await (const chunk of readable) {
      yield chunk;
    }
  }
}

// adapted from StackOverflow
async function streamToString(stream: stream.Readable): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}
