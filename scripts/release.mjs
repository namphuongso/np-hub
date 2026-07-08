#!/usr/bin/env node
/**
 * Quy trình phát hành gom về một lệnh: `npm run release`.
 * Chạy tuần tự Quality Gate -> chọn version -> kiểm tra package -> publish.
 * Dev chỉ cần chọn option khi được hỏi.
 */
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(msg) {
  stdout.write(`${msg}\n`);
}

function step(n, total, title) {
  log(`\n${C.cyan}${C.bold}[${n}/${total}] ${title}${C.reset}`);
}

function run(cmd, args, { allowFail = false } = {}) {
  log(`${C.dim}$ ${cmd} ${args.join(" ")}${C.reset}`);
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (res.status !== 0 && !allowFail) {
    log(`${C.red}✗ Lệnh thất bại: ${cmd} ${args.join(" ")}${C.reset}`);
    process.exit(res.status ?? 1);
  }
  return res.status ?? 0;
}

function capture(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8", shell: false });
  return { status: res.status ?? 1, out: (res.stdout ?? "").trim() };
}

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question, choices) {
  while (true) {
    const answer = (await rl.question(question)).trim().toLowerCase();
    if (choices.includes(answer)) return answer;
    log(`${C.yellow}Vui lòng chọn: ${choices.join(" / ")}${C.reset}`);
  }
}

async function main() {
  const TOTAL = 5;
  log(`${C.bold}NP Hub — Quy trình phát hành${C.reset}`);

  // 1) Kiểm tra đăng nhập NPM
  step(1, TOTAL, "Kiểm tra đăng nhập NPM");
  const who = capture("npm", ["whoami"]);
  if (who.status !== 0) {
    log(`${C.yellow}Chưa đăng nhập NPM. Đang mở npm login...${C.reset}`);
    run("npm", ["login"]);
  } else {
    log(`${C.green}✓ Đã đăng nhập: ${who.out}${C.reset}`);
  }

  // 2) Quality Gate
  step(2, TOTAL, "Quality Gate (lint, typecheck, test, build)");
  run("npm", ["run", "lint"]);
  run("npm", ["run", "typecheck"]);
  run("npm", ["run", "test"]);
  run("npm", ["run", "build"]);
  log(`${C.green}✓ Quality Gate pass${C.reset}`);

  // 3) Chọn version
  step(3, TOTAL, "Chọn loại version");
  log("  patch  — sửa lỗi, không phá API");
  log("  minor  — thêm tính năng tương thích ngược");
  log("  major  — có breaking change");
  log("  skip   — giữ nguyên version hiện tại");
  const choice = await ask(
    `${C.bold}Chọn [patch/minor/major/skip]: ${C.reset}`,
    ["patch", "minor", "major", "skip"]
  );
  if (choice !== "skip") {
    run("npm", ["version", choice]);
  } else {
    log(`${C.dim}Giữ nguyên version.${C.reset}`);
  }
  const pkg = capture("node", ["-p", "require('./package.json').version"]);
  log(`${C.green}✓ Version: ${pkg.out}${C.reset}`);

  // 4) Kiểm tra nội dung package
  step(4, TOTAL, "Kiểm tra nội dung package (npm pack --dry-run)");
  run("npm", ["pack", "--dry-run"]);

  // 5) Publish
  step(5, TOTAL, "Publish lên NPM");
  const access = await ask(
    `${C.bold}Phát hành dạng [public/restricted]: ${C.reset}`,
    ["public", "restricted"]
  );
  const confirm = await ask(
    `${C.yellow}Xác nhận publish v${pkg.out} (${access})? [y/n]: ${C.reset}`,
    ["y", "n"]
  );
  if (confirm !== "y") {
    log(`${C.yellow}Đã huỷ publish.${C.reset}`);
    rl.close();
    process.exit(0);
  }
  run("npm", ["publish", `--access`, access]);

  log(`\n${C.green}${C.bold}✓ Phát hành thành công v${pkg.out}!${C.reset}`);
  log(`${C.dim}Đừng quên kiểm tra trang package trên npm và test cài ở project sạch.${C.reset}`);
  rl.close();
}

main().catch((err) => {
  log(`${C.red}Lỗi: ${err?.message ?? err}${C.reset}`);
  rl.close();
  process.exit(1);
});
