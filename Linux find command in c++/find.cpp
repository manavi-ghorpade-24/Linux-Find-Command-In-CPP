#include <iostream>
#include <string>
#include <string_view>
#include <vector>
#include <cstring>
#include <cstdlib>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <algorithm>

//filtering options
struct FindOptions 
{
    std::string_view name_pattern;
    std::string_view iname_pattern;
    char type_filter = 0;
    bool has_name_filter = false;
    bool has_iname_filter = false;
    bool has_type_filter = false;
};

//glob matching
bool matches_glob(std::string_view filename, std::string_view pattern, bool case_sensitive) //manavi.txt, *txt, true/false
{
    if (pattern.empty()) return true; //If no pattern is given → match everything.
    if (pattern == "*") return true; //If pattern is * → match everything.
    
    if (!case_sensitive) //not case sensitive
    {
        if (pattern[0] == '*' && pattern[pattern.length()-1] == '*') //Case A: Pattern starts and ends with *, like *mid*
        {
            std::string_view substr = pattern.substr(1, pattern.length()-2); //substr(start_index, length)
            return std::search(filename.begin(), filename.end(), 
                             substr.begin(), substr.end(),
                             [](char a, char b) { return tolower(a) == tolower(b); }) != filename.end(); //optimize
        } 
        else if (pattern[0] == '*') //Case B: Pattern starts with *, like. *.txt
        {
            std::string_view suffix = pattern.substr(1);
            if (filename.length() < suffix.length()) return false;
            // std::string_view filename_suffix = filename.substr(filename.length() - suffix.length());
            return std::equal(filename.end()-suffix.length(), filename.end(), 
                            suffix.begin(), 
                            [](char a, char b) { return tolower(a) == tolower(b); });
        } 
        else if (pattern[pattern.length()-1] == '*') //Case C: Pattern ends with * (like "doc*")
        {
            std::string_view prefix = pattern.substr(0, pattern.length()-1);
            if (filename.length() < prefix.length()) return false;
            // std::string_view filename_prefix = filename.substr(0, prefix.length());
            return std::equal(filename.begin(), filename.begin()+prefix.length(), 
                            prefix.begin(), 
                            [](char a, char b) { return tolower(a) == tolower(b); });
        } 
        else //Case D: Exact match
        {
            if (filename.length() != pattern.length()) return false;
            return std::equal(filename.begin(), filename.end(), 
                            pattern.begin(), 
                            [](char a, char b) { return tolower(a) == tolower(b); });
        }
    } 
    else  //case - sensitive
    {
        if (pattern[0] == '*' && pattern[pattern.length()-1] == '*') 
        {
            std::string_view substr = pattern.substr(1, pattern.length()-2);
            return filename.find(substr) != std::string_view::npos;
        } 
        else if (pattern[0] == '*') 
        {
            std::string_view suffix = pattern.substr(1);
            if (filename.length() < suffix.length()) return false;
            return filename.substr(filename.length() - suffix.length()) == suffix;
        }
        else if (pattern[pattern.length()-1] == '*') 
        {
            std::string_view prefix = pattern.substr(0, pattern.length()-1);
            if (filename.length() < prefix.length()) return false;
            return filename.substr(0, prefix.length()) == prefix;
        } 
        else 
        {
            return filename == pattern;
        }
    }
}

//get file using path
std::string_view get_filename(std::string_view path) 
{
    size_t last_slash = path.find_last_of('/');
    return (last_slash != std::string_view::npos) ? 
           path.substr(last_slash + 1) : path;
}

//all filters on path
bool matches_filters(std::string_view path, const FindOptions& options, const struct stat& st) 
{
    if (!options.has_name_filter && !options.has_iname_filter && !options.has_type_filter)  //if no filters
    {
        return true;
    }
    
    if (options.has_type_filter) //if does not match type filter
    {
        if (options.type_filter == 'f' && !S_ISREG(st.st_mode)) return false; //if file is not a regular file
        if (options.type_filter == 'd' && !S_ISDIR(st.st_mode)) return false; //if file is not a directory
    }
    
    
    if (options.has_name_filter || options.has_iname_filter) 
    {
        std::string_view filename = get_filename(path);
        if (options.has_name_filter && !matches_glob(filename, options.name_pattern, true)) 
        {
            return false; //If filename does not match the pattern → return false.
        }
        
        if (options.has_iname_filter && !matches_glob(filename, options.iname_pattern, false)) 
        {
            return false; //If filename does not match the pattern → return false.
        }
    } 
    return true;
}

//searches path in recursive way
void find_recursive(std::string_view path, const FindOptions& options, std::string& buffer) 
{
    struct stat st;
    if (lstat(path.data(), &st) != 0) return; //file does not exist    

    if (matches_filters(path, options, st)) //if file matches filters
    {
        std::cout << path << '\n'; //print file path
    }
    
    if (S_ISDIR(st.st_mode)) //if file is a directory
    {
        DIR* dir = opendir(path.data()); //open directory
        if (!dir) return; //if directory does not exist
        struct dirent* entry; //directory entry
        while ((entry = readdir(dir)) != nullptr) //read directory entries
        {
            std::string_view name = entry->d_name; //get directory entry name
            if (name == "." || name == "..") continue; //skip current and parent directory
            
            size_t old_len = buffer.size(); // /root/file/
            if(!buffer.empty() && buffer.back()!='/')
            {
                buffer += '/';
            }
            //append 
            buffer.append(name); // /root/file/file.txt
            
            find_recursive(buffer, options, buffer); //recursive call - pass buffer directly

            //roll back
            buffer.resize(old_len); // /root
        }
        closedir(dir); //close directory    
    }
}

bool matches_filters_modified(std::filesystem::directory_entry& entry, const FindOptions& options) 
{
    if (!options.has_name_filter && !options.has_iname_filter && !options.has_type_filter)  //if no filters
    {
        return true;
    }

    if (options.has_type_filter) //if does not match type filter
    {
        if (options.type_filter == 'f' && !entry.is_regular_file()) return false; //if file is not a regular file
        if (options.type_filter == 'd' && !entry.is_directory()) return false; //if file is not a directory
    }

    if (options.has_name_filter || options.has_iname_filter) 
    {
        std::string_view filename = entry.path().filename().string();
        if (options.has_name_filter && !matches_glob(filename, options.name_pattern, true)) 
        {
            return false; //If filename does not match the pattern → return false.
        }
        if (options.has_iname_filter && !matches_glob(filename, options.iname_pattern, false))
        {
            return false; //If filename does not match the pattern → return false.
        }
    }
    return true;
}

void find_files(const std::string& root, const FindOptions& options) 
{
    for (const auto& entry : std::filesystem::recursive_directory_iterator(root)) 
    {
        //const auto& path = entry.path();
        // struct stat st;
        // lstat(path.c_str(), &st); // Only needed if you want to use your existing matches_filters

        if (matches_filters_modified(entry, options)) 
        {
            std::cout << entry.path().string() << '\n';
        }
    }
}

void print_usage(const char* program_name) 
{
    std::cerr << "Usage: " << program_name << " <path> [-name <pattern>] [-iname <pattern>] [-type <f|d>]" << std::endl;
    std::exit(1);
}

int main(int argc, char* argv[]) 
{
    if (argc < 2) 
    {
        print_usage(argv[0]);
    }
    
    std::string start_path = argv[1];
    FindOptions options;
    
    for (int i = 2; i < argc; i++) 
    {
        std::string_view arg = argv[i];
        
        if (arg == "-name" && i + 1 < argc) 
        {
            options.name_pattern = argv[++i];
            options.has_name_filter = true;
        } 
        else if (arg == "-iname" && i + 1 < argc) 
        {
            options.iname_pattern = argv[++i];
            options.has_iname_filter = true;
        } 
        else if (arg == "-type" && i + 1 < argc) 
        {
            std::string_view type = argv[++i];
            if (type == "f" || type == "d") 
            {
                options.type_filter = type[0];
                options.has_type_filter = true;
            } else 
            {
                std::cerr << "Invalid type: " << type << std::endl;
                std::exit(1);
            }
        } 
        else 
        {
            std::cerr << "Unknown option: " << arg << std::endl;
            print_usage(argv[0]);
        }
    }

    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::string buffer;
    buffer.reserve(4094);
    buffer = start_path;
    find_recursive(start_path, options, buffer);
    return 0;
}