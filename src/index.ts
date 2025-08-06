import { TABLE_PROMPTS } from "./prompts/examples.ts";
import Agent from "./agent.ts";

const agent = new Agent({
  // model: "qwen-max", // 通义千问
  useOllama: true,
  model: "qwen3:14b",
  fileDir: `${process.cwd()}/generated`,
});

agent.runOnce(TABLE_PROMPTS);
// agent.run();
