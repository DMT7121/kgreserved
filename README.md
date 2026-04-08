# 🔥 KING'S GRILL — KG RESERVED v2.0

> Hệ thống quản lý đặt bàn thông minh với AI Core V4.0 — Tự động phân tích đơn hàng, render bill 4K, đồng bộ Google Sheets.

## ⚡ Tech Stack

- **Frontend**: Vue 3 (Composition API) + Vite + Tailwind CSS
- **State**: Pinia (modular stores)
- **AI Engine**: 9-platform waterfall routing (Gemini, GPT, Llama, DeepSeek...)
- **Backend**: Google Apps Script (Sheets + Drive)
- **Design**: Google Stitch (MCP integration)
- **Deploy**: Cloudflare Pages (`kg-reserved.pages.dev`)

## 🚀 Quick Start

```bash
npm install
npm run dev      # Dev server at localhost:3000
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── core/        # AppLayout, LeftPanel, BillPreview
│   ├── forms/       # AIInput, CustomerForm, DepositManager, MenuEditor
│   ├── history/     # HistoryList
│   └── modals/      # 7 modal components
├── composables/     # useAI, useForm, useBillRender
├── stores/          # Pinia stores (UI, Form, App, Config)
├── services/        # GAS API gateway
├── utils/           # Constants, helpers
└── styles/          # Tailwind + custom CSS
gas/
├── Backend.gs       # GAS backend (Orders, Menu, Config, Calendar)
└── MenuSeeder.gs    # Menu data seeder
```

## 🔑 Environment Variables

```env
VITE_GAS_URL=https://script.google.com/macros/s/.../exec
VITE_R2_URL=https://kg-images.dmt-kgwork.workers.dev
```

## 🎨 Design with Google Stitch

This project uses [Google Stitch](https://stitch.withgoogle.com/) for UI/UX design via MCP integration.

## 🔗 Links

- **GitHub**: https://github.com/DMT7121/kgreserved
- **Live**: https://kg-reserved.pages.dev

## 📄 License

Private — King's Grill © 2025-2026
