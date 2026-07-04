"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <Giscus
        repo="jaudi/easyvisuals-portal"
        repoId="R_kgDORhn9Nw"
        category="General"
        categoryId="DIC_kwDORhn9N84DAe9B"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark_dimmed"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
