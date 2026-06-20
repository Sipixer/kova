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

type Job = {
  text: string;
  resolve: (vector: number[]) => void;
  reject: (error: unknown) => void;
};

// Single worker so we never run a burst of embeddings at once. `high` priority
// (search queries) jumps ahead of `low` priority (background capture indexing).
const queues: Record<"high" | "low", Job[]> = { high: [], low: [] };
let draining = false;

async function drain() {
  if (draining) return;
  draining = true;
  try {
    const extract = await getExtractor();
    for (;;) {
      const job = queues.high.shift() ?? queues.low.shift();
      if (!job) break;
      try {
        const output = await extract(job.text, {
          pooling: "mean",
          normalize: true,
        });
        job.resolve(Array.from(output.data as Float32Array));
      } catch (error) {
        job.reject(error);
      }
    }
  } finally {
    draining = false;
  }
}

/** Embed text into a 384-dim normalized vector via the priority queue. */
export function embed(
  text: string,
  priority: "high" | "low" = "low",
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    queues[priority].push({ text, resolve, reject });
    void drain();
  });
}
