# @foxpage/foxpage-cli

a `CLI` tool for [foxpage](https://github.com/foxpage)

## 🖥 Environment Support

[![Minimum node.js version](https://img.shields.io/badge/node-%3E%3D12.14.1-brightgreen)](https://img.shields.io/badge/node-%3E%3D12.14.1-brightgreen)
[![typescript version](https://img.shields.io/badge/typescript-%3E%3D4.0.0-brightgreen)](https://img.shields.io/badge/typescript-%3E%3D4.0.0-brightgreen)
[![yarn](https://img.shields.io/badge/yarn-1.22.5-blue)](https://img.shields.io/badge/yarn-1.22.5-blue)

## ⌨️ Usage

The root level command is `foxpage`:

```sh
# see version
foxpage -v

# get help
foxpage -h
```

The secondary level command is `cmpt` and `server`:

- `cmpt`: Component-related, including component resource building, component creation, component template maintenance, creating componentized projects
- `server`: System level project related. Currently includes pulling and installing all system-level items, but more functionality will be added in the future

### foxpage-cmpt

An instruction tool that handles component-related processes. Include `build`, `project`, `package` command:

- `foxpage-cmpt build`: Building component resources, Detailed build parameters can be viewed `foxpage-cmpt build -h`
- `foxpage-cmpt project`: Create a componentized project. Used with command `foxpage-cmpt project my-project`
- `foxpage-cmpt package`: Currently, only the new component function is included. The following functions may be expanded according to user requirements, Used with command `foxpage-cpmt project new`

```sh
foxpage-cmpt -h
# Usage: foxpage-cmpt [options] [command]

# foxpage-component tool

# Options:
#   -h, --help           display help for command

# Commands:
#   project <name>       create a new foxpage-component-[name] project
#   build                foxpage component tool, build for foxpage component
#   package <commander>  foxpage component package tool
#   help [command]       display help for command
```

### foxpage-cmpt build

Resource builds of components.
Resources in the `/dist` directory are registered for the FoxPage platform
Resources in the `/es` and `/lib` directory are used for NPM repository publishing component package resources

Command option details:

```sh
foxpage-cmpt build -h
# Usage: foxpage-cmpt build [options]

# Options:
#   -F, --foxpage                   Build umd for foxpage
#   -FR, --foxpage-root             Build umd for foxpage in root
#   -L, --lib                       Build lib(cjs) for npm
#   -E, --es-module                 Build es(es-module) for npm
#   -S, --schema-md                 Build schema.md to describe the api of component
#   --clean                         Clean dist directory (default: true)
#   --no-clean                      Set --clean to false
#   --assets-hash                   Build files in assets using the WebPack Contenthash parameter
#   --debug                         Debug: some temp file or data will be retained
#   --root-cache                    Cache <root>/dist directory for all package (default: true)
#   --no-root-cache                 Set --root-cache to false
#   --npm-client <npmClient>        Executable used to run scripts (npm, yarn, ...). (default: "npm")
#   --concurrency <concurrency>     Number of concurrently pending subprocess(default: Max(os.cpus().length - 1, 2)) (default: 3)
#   --modes <modes>                 Build modes, includes: "production,debug,node,editor", split by ",", (only support --foxpage)
#   --file-hash                     Build all files using the WebPack Contenthash parameter
#   --progress-plugin               Use webpack.ProgressPlugin when webpack build
#   --analyze                       Analyze build result. can be used with "--package-dir" (run on the "<root>/"), (only support --foxpage) (default: false)
#   --zip-fox                       Automatically compress build resources for the FoxPage component registration process, (only support --foxpage)
#   --no-zip-fox                    Set --zip to false
#   --babel-options <babelOptions>  Customer babel cli options, (only support --es/lib)
#   --ts-declaration                Generate typescript declaration (*.d.ts), (only support --es/lib) (default: true)
#   --no-ts-declaration             Set --ts-declaration to false
#   --css-style                     build style from index.(less/scss) to index.css. please used with --remove-style-import. mode name is style. (only support --es/lib)
#   --remove-style-import           Remove style import for all ".js" file. It's usually used with --css-style. (only support --es/lib)
#   --import-index-css              When use --remove-style-import, add "import './index.css'" in root index.js, (only support --es/lib)
#   -h, --help                      display help for command
```

### foxpage-cmpt project

Create a component development project.

For example, create a component project called `foxpage-component-trip-sales` as follows:

```sh
foxpage-cmpt project trip-sales
```

Command option details:

```sh
foxpage-cmpt project -h
# Usage: foxpage-cmpt project [options] <name>

# Options:
#   -h, --help  display help for command
```

### foxpage-cmpt package

Command option details:

```sh
foxpage-cmpt package -h
# Usage: foxpage-cmpt package [options] [command]

# foxpage component package tools

# Options:
#   -h, --help      display help for command

# Commands:
#   new             create a new component
#   help [command]  display help for command

foxpage-cmpt package new -h
# Usage: foxpage-cmpt-package-new [options]

# Options:
#   --templates <templateDir>  templates dir location. you can select subfolders to determine the path of the template
#   --template <templateDir>   template dir location
#   --formate                  formate code after create
#   -h, --help                 display help for command
```

## foxpage-serve

Command option details:

```sh
foxpage-server -h
# Usage: foxpage-server <command> [options]

# foxpage server tool

# Options:
#   -h, --help      display help for command

# Commands:
#   fetch           pull project
#   install         install dependencies
#   help [command]  display help for command
```

### foxpage-server fetch

Pull all projects that need to be started or deployed:

```sh
foxpage-server fetch
```

### foxpage-server install

Install dependencies for all projects:

```sh
foxpage-server install
```
