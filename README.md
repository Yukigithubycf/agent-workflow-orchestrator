# AstraFlow

AstraFlow 是一个基于 LangGraph 构建的全栈 AI 智能体平台，提供多轮对话、任务编排、工具调用、记忆管理和沙箱执行能力。

## 技术栈

| 模块       | 主要技术                                                   |
| ---------- | ---------------------------------------------------------- |
| 前端       | Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix UI |
| 后端       | Python 3.12+、FastAPI、LangGraph、Uvicorn                  |
| 数据与通信 | Redis、SQLite（默认）/ PostgreSQL（可选）、SSE             |
| 基础设施   | Docker、Docker Compose、Nginx                              |

项目主要包含以下服务：

- `frontend`：Next.js Web 界面
- `gateway`：FastAPI 接口与智能体运行时
- `redis`：流式消息与跨进程通信
- `nginx`：统一反向代理入口

## 部署方法

推荐使用 Docker Compose 进行生产部署。

### 1. 环境要求

- Docker Engine 或 Docker Desktop
- Docker Compose v2
- Python 3.12+
- GNU Make
- Windows 环境需要 Git Bash 或 WSL

### 2. 初始化配置

首次部署时，在项目根目录执行：

```bash
make config
```

该命令会根据模板生成：

- `config.yaml`
- `.env`
- `frontend/.env`

如果这些配置文件已经存在，请跳过此步骤。部署前需要在 `config.yaml` 和 `.env` 中填写模型服务地址、API Key 等实际配置。

### 3. 启动服务

```bash
make up
```

首次启动会构建 Docker 镜像并启动完整服务。启动完成后访问：

```text
http://localhost:2026
```

可通过 `.env` 中的 `PORT` 修改对外端口。

### 4. 常用命令

```bash
make up       # 构建并启动生产环境
make down     # 停止并移除生产容器
make doctor   # 检查配置和运行环境
```

查看当前容器状态：

```bash
docker compose -p deer-flow -f docker/docker-compose.yaml ps
```
