import audio from "@/assets/file-icons/audio.svg";
import document from "@/assets/file-icons/document.svg";
import html from "@/assets/file-icons/html.svg";
import image from "@/assets/file-icons/image.svg";
import javascript from "@/assets/file-icons/javascript.svg";
import json from "@/assets/file-icons/json.svg";
import markdown from "@/assets/file-icons/markdown.svg";
import pdf from "@/assets/file-icons/pdf.svg";
import powerpoint from "@/assets/file-icons/powerpoint.svg";
import table from "@/assets/file-icons/table.svg";
import typescript from "@/assets/file-icons/typescript.svg";
import video from "@/assets/file-icons/video.svg";
import word from "@/assets/file-icons/word.svg";

import { cn } from "@/lib/utils";

const BY_EXT: Record<string, string> = {
  docx: word,
  doc: word,
  odt: word,
  rtf: word,
  xlsx: table,
  xls: table,
  ods: table,
  csv: table,
  tsv: table,
  pptx: powerpoint,
  ppt: powerpoint,
  odp: powerpoint,
  pdf,
  png: image,
  jpg: image,
  jpeg: image,
  gif: image,
  webp: image,
  bmp: image,
  svg: image,
  ico: image,
  heic: image,
  md: markdown,
  markdown,
  ts: typescript,
  tsx: typescript,
  mts: typescript,
  js: javascript,
  jsx: javascript,
  mjs: javascript,
  cjs: javascript,
  html,
  htm: html,
  json,
  mp4: video,
  mov: video,
  mkv: video,
  webm: video,
  avi: video,
  m4v: video,
  mp3: audio,
  wav: audio,
  flac: audio,
  ogg: audio,
  m4a: audio,
};

/** Real, colored file-type icon for a capture source (extension). */
export function FileIcon({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const src = BY_EXT[source.toLowerCase()] ?? document;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn("size-5 shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
