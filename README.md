# @foxpage/foxpage-cli

`foxpage` 开源项目脚手架工具, 建议使用 `yarn` 来做包管理.

## Usage

脚手架一级指令是 `foxpage`:

``` sh
# 查看版本
foxpage -v

# 获取帮助提示
foxpage -h
```

二级指令目前分为 `cmpt` `server` 两类。

- `cmpt`: 组件相关, 包含组件资源构建, 组件新建, 组件模板维护, 创建组件化项目
- `server`: 系统级项目相关, 目前包含所以系统级别项目的拉取、安装, 未来会增加更多的功能
## foxpage-cmpt

处理组件相关的流程的指令工具, 下一级指令分为 `build`, `project`, `package`,

- `foxpage-cmpt build`: 构建组件资源, 详细构建参数可通过 `foxpage-cmpt build -h` 查看
- `foxpage-cmpt project`: 新建组件化项目, 通过指令 `foxpage-cmpt project my-project` 创建组件化模板项目
- `foxpage-cmpt package`: 目前仅包含新建组件功能, 后面功能上可能会根据用户需求做一些扩展, 目前可通过 `foxpage-cpmt project new` 根据选择的模板新建组件

``` sh
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

对组件进行资源构建, `/dist` 目录下的资源用于foxpage平台进行注册, `/es` `/lib` 目录下的资源用于 npm 仓库发布组件组件包资源

详细构建参数如下:

``` sh
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

创建组件开发项目, 例如创建一个名叫 `foxpage-component-trip-sales` 的组件项目方式如下:

``` sh
foxpage-cmpt project trip-sales
```

详细构建参数如下:

``` sh
foxpage-cmpt project -h
# Usage: foxpage-cmpt project [options] <name>

# Options:
#   -h, --help  display help for command
```

### foxpage-cmpt package

详细构建参数如下:

``` sh
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

详细构建参数如下:

``` sh
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

拉取 `foxpage` 所有需要启动或部署的项目, 方式如下:

``` sh
foxpage-server fetch
```

### foxpage-server install

为所有项目安装依赖, 方式如下:

``` sh
foxpage-server install
```