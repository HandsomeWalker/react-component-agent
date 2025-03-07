import OpenAI from "openai";
import systemPrompts from "./prompts/system.ts";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import tools from "./tools";
import readline from "readline";

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface AgentConfigProps {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  fileDir?: string;
}
interface ResponseProps {
  content: string;
  tools: any[];
}

export default class Agent {
  private apiKey = process.env.DASHSCOPE_API_KEY;
  private baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
  private model = "deepseek-r1-distill-llama-70b";
  private messages: ChatCompletionCreateParamsBase["messages"] = [
    {
      role: "system",
      content: systemPrompts,
    },
  ];
  private openai: OpenAI;
  private fileDir: string = `${process.cwd()}/aiComponents`;
  constructor(config?: AgentConfigProps) {
    this.openai = new OpenAI({
      apiKey: config?.apiKey ?? this.apiKey,
      baseURL: config?.baseURL ?? this.baseURL,
    });
    config?.model && (this.model = config.model);
    config?.fileDir && (this.fileDir = config.fileDir);
  }
  private askQuestion() {
    return new Promise((resolve) => {
      rl.question("用户需求：", (answer) => {
        resolve(answer);
      });
    });
  }
  private confirmToolAccess(toolName: string) {
    return new Promise((resolve) => {
      console.log(`请求工具调用：${toolName}`);
      rl.question("是否给予权限？(y/n): ", (answer) => {
        if (
          answer.trim().toLowerCase() === "y" ||
          answer.trim().toLowerCase() === ""
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  private async getResponse(userPrompts): Promise<ResponseProps> {
    let reasoningContent = ""; // 定义完整思考过程
    let answerContent = ""; // 定义完整回复
    let isAnswering = false; // 判断是否结束思考过程并开始回复

    this.messages.push({
      role: "user",
      content: userPrompts,
    });
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: this.messages,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    });

    console.log("\n" + "=".repeat(20) + "思考过程" + "=".repeat(20) + "\n");

    for await (const chunk of completion) {
      // 处理usage信息
      if (!chunk.choices?.length) {
        console.log(
          "\n" + "=".repeat(20) + "Token 使用情况" + "=".repeat(20) + "\n"
        );
        console.log(chunk.usage);
        continue;
      }

      const delta = chunk.choices[0].delta;

      // 检查是否有reasoning_content属性
      // if (!("reasoning_content" in delta)) {
      //   continue;
      // }

      // 处理空内容情况
      // if (!delta.reasoning_content && !delta.content) {
      //   continue;
      // }

      // 处理开始回答的情况
      if (!(delta as any).reasoning_content && !isAnswering) {
        console.log("\n" + "=".repeat(20) + "完整回复" + "=".repeat(20) + "\n");
        isAnswering = true;
      }

      // 处理思考过程
      if ((delta as any).reasoning_content) {
        process.stdout.write((delta as any).reasoning_content as string);
        reasoningContent += (delta as any).reasoning_content;
      }
      // 处理回复内容
      else if (delta.content) {
        process.stdout.write(delta.content);
        answerContent += delta.content;
      }
    }
    this.messages.push({
      role: "assistant",
      content: answerContent,
    });
    return { content: answerContent, tools: this.getToolNames() };
  }
  private getToolNames() {
    const tools: string[] = [];
    const content = this.messages[this.messages.length - 1].content as string;
    if (/<write_to_file>(.|\n|\r|\r\n)*?<\/write_to_file>/gm.test(content)) {
      tools.push("write_to_file");
    }
    return tools;
  }
  private async callTools(response: ResponseProps) {
    for (const toolName of response.tools) {
      if (toolName in tools) {
        const isConfirmed = await this.confirmToolAccess(toolName);
        isConfirmed &&
          tools[toolName]({
            content: response.content,
            fileDir: this.fileDir,
          });
      }
    }
  }
  async run() {
    while (true) {
      const requirement = await this.askQuestion();
      const response = await this.getResponse(requirement);
      await this.callTools(response);
    }
  }
  async runOnce(userPrompts: string) {
    const response = await this.getResponse(userPrompts);
    await this.callTools(response);
    rl.close();
  }
}
