import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

type CommitEntry = {
  date: string;
  hash: string;
  subject: string;
};

const rawLog = execFileSync(
  "git",
  ["log", "--date=short", "--pretty=format:%ad%x09%h%x09%s"],
  {
    encoding: "utf8"
  }
);

const entries = rawLog
  .split(/\r?\n/)
  .filter(Boolean)
  .map<CommitEntry>((line) => {
    const [date, hash, ...subjectParts] = line.split("\t");
    return {
      date,
      hash,
      subject: subjectParts.join("\t")
    };
  });

const grouped = entries.reduce<Record<string, CommitEntry[]>>((acc, entry) => {
  acc[entry.date] = [...(acc[entry.date] ?? []), entry];
  return acc;
}, {});

const sections = Object.entries(grouped).map(([date, commits]) => {
  const lines = commits.map((commit) => `- ${commit.subject} (${commit.hash})`);
  return [`## ${date}`, ...lines].join("\n");
});

const content = [
  "# Changelog",
  "",
  "이 파일은 주요 수정사항과 배포 관련 변경을 날짜별로 기록합니다.",
  "",
  "커밋 메시지 기반으로 갱신하려면 `npm run changelog:update`를 실행하세요.",
  "",
  ...sections,
  ""
].join("\n");

writeFileSync("CHANGELOG.md", content, "utf8");
