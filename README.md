# 配置API_KEY

默认使用[阿里云百炼平台](https://bailian.console.aliyun.com/?apiKey=1#/api-key)的大模型，没有KEY的话去申请。
可以配置到环境变量里，变量名是`DASHSCOPE_API_KEY`。

或者直接显式传入

```typescript
const agent = new Agent({ apiKey: 'your api key' });
```

# 说明

理论上可以使用所有openai兼容的模型，只需要配置不同的API_KEY和BASE_URL。

# 使用

```typescript
const agent = new Agent({
  model: "deepseek-r1-distill-llama-70b",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY,
  fileDir: `${process.cwd()}/src/components`,
});

agent.run();
```

自行修改`index.ts`文件后，可以使用bun或者deno直接运行ts文件。
需要安装openai依赖

```bash
bun install openai
bun run test
```
