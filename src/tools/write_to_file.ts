import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface WriteToFileOptions {
  content: string;
  fileDir: string;
}

// 获取当前模块的URL
const currentModuleUrl = import.meta.url;
// 将URL转换为文件路径
const currentFilePath = fileURLToPath(currentModuleUrl);
// 获取当前文件所在目录
const currentDir = path.dirname(currentFilePath);

// 创建文件夹或文件的函数
function createNestedItem(filePath, content?) {
  const dir = path.dirname(filePath);

  // 如果目录不存在，则递归创建目录
  if (!fs.existsSync(dir)) {
    createNestedItem(dir);
  }

  // 如果content为null，说明要创建文件夹
  if (!content) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
      console.log(`创建文件夹：${filePath}`);
    }
  } else {
    // 如果content不为null，说明要创建文件
    fs.writeFileSync(filePath, content);
    console.log(`创建文件：${filePath}`);
  }
}

export default function write_to_file(options: WriteToFileOptions) {
  const matchs = options.content.match(
    /^<write_to_file>(.|\n|\r|\r\n)*?<\/write_to_file>$/gm
  );
  matchs?.forEach((matchTxt: string) => {
    const filePath = matchTxt
      .match(/<path>(.|\n|\r|\r\n)*?<\/path>/)?.[0]
      ?.replace(/(<path>|<\/path>)/g, "");
    filePath &&
      createNestedItem(
        path.resolve(currentDir, `${options.fileDir}/${filePath}`),
        matchTxt
          .match(/<content>(.|\n|\r|\r\n)*?<\/content>$/gm)?.[0]
          ?.replace(/(<content>|<\/content>)/g, "")
      );
  });
}
