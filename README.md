# Linux-Find-Command-In-C++
Linux Find command with performance

# Recursive File Finder (C++)

This is a simple C++ command-line tool that recursively searches directories and lists files and directories based on filtering options like:

* `-name` (case-sensitive glob match)
* `-iname` (case-insensitive glob match)
* `-type` (filter by file or directory)

The utility mimics a simplified version of the Unix `find` command and supports basic glob patterns like `*prefix`, `suffix*`, `*mid*`, and exact matches.

---

## Features

*  Recursively searches directories
*  Filters by:

  * Case-sensitive filename (`-name`)
  * Case-insensitive filename (`-iname`)
  * Type (`-type f` for files, `-type d` for directories)
* 🌟 Pattern matching with wildcard `*`

---

## Dependencies

* C++17 or above (uses `std::filesystem`)
* Unix-like system (Linux/macOS) for `dirent.h`, `lstat`, etc.

---

## Build Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/recursive-file-finder.git
cd recursive-file-finder
```

### 2. Compile the code

Using `g++`:

```bash
g++ -std=c++17 -Wall -O2 find.cpp -o find
```

> Ensure your compiler supports C++17 (`std::filesystem` is used).

---

## ▶️ Run Instructions

```bash
./find <start_path> [options]
```

### Options

| Option    | Description                             |
| --------- | --------------------------------------- |
| `-name`   | Case-sensitive glob match on filename   |
| `-iname`  | Case-insensitive glob match on filename |
| `-type f` | Match only regular files                |
| `-type d` | Match only directories                  |

---

### Examples

#### 1. List all files and directories recursively from `/home/user`

```bash
./find /home/user
```

#### 2. Find all `.txt` files (case-sensitive)

```bash
./find . -name "*.txt"
```

#### 3. Find all `.DOC` or `.doc` files (case-insensitive)

```bash
./find . -iname "*.doc"
```

#### 4. Find only directories that start with `data`

```bash
./find . -name "data*"
```

#### 5. Find only regular files under `/var/log`

```bash
./find /var/log -type f
```

---

## Project Structure

```text
.
├── find.cpp      # Main source code
└── README.md     # You're here!
```

---

## How It Works

* Uses `lstat` and `dirent.h` for directory traversal (`find_recursive`).
* Optionally supports `std::filesystem`-based traversal with `find_files()`.
* Implements basic glob-matching logic manually (does not rely on external libraries).
* Applies all filters (name, iname, type) before printing each path.

---

## TODOs (Optional Enhancements)

* [ ] Add support for full glob syntax (`?`, `[]`, etc.)
* [ ] Add depth limit or max depth flag
* [ ] Support exclusion patterns
* [ ] Windows compatibility (`#ifdef _WIN32`)

---

## Author

**Manavi Uttam Ghorpade**
