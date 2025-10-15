// vite.config.ts
import { defineConfig } from 'vite';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { loadEnv } from 'vite';
// 使用 Vite 的 defineConfig 来包裹整个配置
export default defineConfig(({ mode }) => {
  // 定义测试配置
  const testConfig = defineWorkersConfig({
    test: {
      env: loadEnv(mode, process.cwd(), ''),
      globalSetup: './tests/setup.ts',
      poolOptions: {
        workers: {
          singleWorker: true,
          isolatedStorage: false,
          wrangler: {
            // 注意：请确保部署时使用的也是这个配置文件
            // wrangler deploy 默认会寻找 wrangler.toml
            configPath: './wrangler.jsonc', 
          },
          miniflare: {
            cf: true,
          },
        },
      },
    },
  });
  // 返回合并后的配置
  return {
    // ↓↓↓ 这是解决您问题的关键部分 ↓↓↓
    build: {
      rollupOptions: {
        // 将所有 'node:' 开头的模块标记为外部依赖
        // 这会告诉 Vite：“不要打包这些模块，让 Cloudflare 环境来提供它们”
        external: [/^node:.*/],
      },
    },
    // ↑↑↑ 关键部分结束 ↑↑↑
    // 保留您原有的测试配置
    test: testConfig.test,
  };
});
