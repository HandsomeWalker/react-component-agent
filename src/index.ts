import { HERO_PROMPTS } from "./prompts/examples.ts";
import Agent from "./agent.ts";

const agent = new Agent({
  model: "qwen-max", // 通义千问
  fileDir: `${process.cwd()}/generated`,
});

// agent.runOnce(HERO_PROMPTS);
agent.run();
