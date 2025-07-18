import { $, write } from "bun";
import { normalize, resolve, relative, join } from "path";
import { test, expect } from "bun:test";
import { mkdirSync } from "fs";

const FIND_PATH = "./find";

try {
 await Promise.all([
   write(join("test-dir", "dir1", "4file.txt"), "hi"),
   write(join("test-dir", "dir1", "fil5e.txt"), "hi"),
   write(join("test-dir", "dir1", "file3.txt"), "hi"),
   write(join("test-dir", "dir2", "file2.txt"), "hi"),
   write(join("test-dir", "dir2", "FILE3.txt"), "hi"),
   write(join("test-dir", "DIR3", "FiLe1OnE.txT"), "hi"),
   write(join("test-dir", "file-or-dir"), "hi"),
 ]);

 mkdirSync(join("test-dir", "dir2", "file-or-dir"), { recursive: true });
} catch (e) {}

const find = resolve(relative(import.meta.dir, FIND_PATH));

test(`${find} test-dir`, async () => {
 const output = await $`${find} test-dir`.quiet();
 const actual = toActual(output);

 const expected = [
   "test-dir",
   "test-dir/dir2",
   "test-dir/dir2/file2.txt",
   "test-dir/dir2/FILE3.txt",
   "test-dir/dir2/file-or-dir",
   "test-dir/DIR3",
   "test-dir/DIR3/FiLe1OnE.txT",
   "test-dir/file-or-dir",
   "test-dir/dir1",
   "test-dir/dir1/file3.txt",
   "test-dir/dir1/4file.txt",
   "test-dir/dir1/fil5e.txt",
 ];
 for (const expectedPath of expected) {
    expect(actual).toContain(expectedPath);
  }
 
  const unexpected = actual.filter((path) => !expected.includes(path));
  if (unexpected.length > 0) {
    expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
  }
 });
 
 test(`${find} test-dir -type d`, async () => {
  const output = await $`${find} test-dir -type d`.quiet();
  const actual = toActual(output);
 
  const expected = [
    "test-dir",
    "test-dir/dir2",
    "test-dir/dir2/file-or-dir",
    "test-dir/DIR3",
    "test-dir/dir1",
  ];
 
  for (const expectedPath of expected) {
    expect(actual).toContain(expectedPath);
  }
 
  const unexpected = actual.filter((path) => !expected.includes(path));
  if (unexpected.length > 0) {
    expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
  }
 });
 
 test(`${find} test-dir -type f`, async () => {
  const output = await $`${find} test-dir -type f`.quiet();
  const actual = toActual(output);
 
  const expected = [
    "test-dir/dir2/file2.txt",
    "test-dir/dir2/FILE3.txt",
    "test-dir/DIR3/FiLe1OnE.txT",
    "test-dir/file-or-dir",
    "test-dir/dir1/file3.txt",
"test-dir/dir1/4file.txt",
   "test-dir/dir1/fil5e.txt",
 ];

 for (const expectedPath of expected) {
   expect(actual).toContain(expectedPath);
 }

 const unexpected = actual.filter((path) => !expected.includes(path));
 if (unexpected.length > 0) {
   expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
 }
});

test(`${find} test-dir -name file-or-dir`, async () => {
 const output = await $`${find} test-dir -name file-or-dir`.quiet();
 const actual = toActual(output);

 const expected = ["test-dir/dir2/file-or-dir", "test-dir/file-or-dir"];

 for (const expectedPath of expected) {
   expect(actual).toContain(expectedPath);
 }

 const unexpected = actual.filter((path) => !expected.includes(path));
 if (unexpected.length > 0) {
   expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
 }
});

test(`${find} test-dir -name file-or-dir -type d`, async () => {
 const output = await $`${find} test-dir -name file-or-dir -type d`.quiet();
 const actual = toActual(output);

 const expected = ["test-dir/dir2/file-or-dir"];

 for (const expectedPath of expected) {
   expect(actual).toContain(expectedPath);
 }

 const unexpected = actual.filter((path) => !expected.includes(path));
 if (unexpected.length > 0) {
    expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -name file-or-dir -type f`, async () => {
const output = await $`${find} test-dir -name file-or-dir -type f`.quiet();
const actual = toActual(output);

const expected = ["test-dir/file-or-dir"];

for (const expectedPath of expected) {
  expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -iname file3.txt`, async () => {
const output = await $`${find} test-dir -iname file3.txt`.quiet();
const actual = toActual(output);
const expected = ["test-dir/dir1/file3.txt", "test-dir/dir2/FILE3.txt"];

for (const expectedPath of expected) {
  expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -name '*3.txt'`, async () => {
const output = await $`${find} test-dir -name '*3.txt'`.quiet();
const actual = toActual(output);

const expected = ["test-dir/dir1/file3.txt", "test-dir/dir2/FILE3.txt"];

for (const expectedPath of expected) {
    expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -name 'file*'`, async () => {
const output = await $`${find} test-dir -name 'file*'`.quiet();
const actual = toActual(output);

const expected = [
  "test-dir/dir1/file3.txt",
  "test-dir/dir2/file-or-dir",
  "test-dir/dir2/file2.txt",
  "test-dir/file-or-dir",
];
for (const expectedPath of expected) {
  expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -name '*file*'`, async () => {
const output = await $`${find} test-dir -name '*file*'`.quiet();
const actual = toActual(output);

const expected = [
  "test-dir/dir2/file-or-dir",
  "test-dir/file-or-dir",
  "test-dir/dir1/file3.txt",
  "test-dir/dir1/4file.txt",
  "test-dir/dir2/file2.txt",
];

for (const expectedPath of expected) {
    expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -iname 'fIlE*'`, async () => {
const output = await $`${find} test-dir -iname 'fIlE*'`.quiet();
const actual = toActual(output);

const expected = [
  "test-dir/dir1/file3.txt",
  "test-dir/dir2/file-or-dir",
  "test-dir/dir2/file2.txt",
  "test-dir/file-or-dir",
  "test-dir/dir2/FILE3.txt",
  "test-dir/DIR3/FiLe1OnE.txT",
];
for (const expectedPath of expected) {
  expect(actual).toContain(expectedPath);
}

const unexpected = actual.filter((path) => !expected.includes(path));
if (unexpected.length > 0) {
  expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
}
});

test(`${find} test-dir -iname '*FiLe*'`, async () => {
const output = await $`${find} test-dir -iname '*FiLe*'`.quiet();
const actual = toActual(output);

const expected = [
  "test-dir/dir2/file-or-dir",
  "test-dir/file-or-dir",
  "test-dir/dir1/file3.txt",
  "test-dir/dir1/4file.txt",
  "test-dir/dir2/file2.txt",
  "test-dir/dir2/FILE3.txt",
"test-dir/DIR3/FiLe1OnE.txT",
 ];

 for (const expectedPath of expected) {
   expect(actual).toContain(expectedPath);
 }

 const unexpected = actual.filter((path) => !expected.includes(path));
 if (unexpected.length > 0) {
   expect().fail(`Unexpected paths found: ${unexpected.join(", ")}`);
 }
});

function toActual(output) {
 const res = (
   output.stdout.byteLength ? output.stdout : output.stderr
 ).toString();

 return res
   .split(/\r?\n/)
   .filter((line) => line.trim() !== "")
   .map((line) => normalize(line.trim()));
}
