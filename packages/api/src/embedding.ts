import {
  type FeatureExtractionPipeline,
  pipeline,
} from "@huggingface/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2"; // 384-dim sentence embeddings

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL);
  }
  return extractorPromise;
}

/** Embed a piece of text into a 384-dim normalized vector. */
export async function embed(text: string): Promise<number[]> {
  const extract = await getExtractor();
  const output = await extract(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/** Format a JS number[] as a pgvector literal: "[0.1,0.2,...]". */
export function toVector(values: number[]): string {
  return `[${values.join(",")}]`;
}
