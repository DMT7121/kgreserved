/**
 * APPLICATION CONSTANTS
 * Migrated from King's Grill Manager AI v1.8.6
 */

// --- PLATFORM-CENTRIC AI PROVIDERS ---
export interface PlatformConfig {
  name: string
  getUrl: string
  icon: string
  color: string
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  google: { name: 'Google AI Studio', getUrl: 'https://aistudio.google.com/app/apikey', icon: 'fa-google', color: 'text-blue-500' },
  groq: { name: 'GroqCloud', getUrl: 'https://console.groq.com/keys', icon: 'fa-bolt', color: 'text-orange-500' },
  cerebras: { name: 'Cerebras', getUrl: 'https://cloud.cerebras.ai/', icon: 'fa-brain', color: 'text-purple-500' },
  sambanova: { name: 'SambaNova', getUrl: 'https://cloud.sambanova.ai/', icon: 'fa-server', color: 'text-indigo-500' },
  github: { name: 'GitHub Models', getUrl: 'https://github.com/settings/tokens', icon: 'fa-github', color: 'text-gray-800' },
  openrouter: { name: 'OpenRouter', getUrl: 'https://openrouter.ai/keys', icon: 'fa-route', color: 'text-blue-400' },
  mistral: { name: 'Mistral AI', getUrl: 'https://console.mistral.ai/', icon: 'fa-wind', color: 'text-teal-500' },
  huggingface: { name: 'Hugging Face', getUrl: 'https://huggingface.co/settings/tokens', icon: 'fa-face-smiling-hands', color: 'text-yellow-500' },
  pollinations: { name: 'Pollinations (Free)', getUrl: 'https://pollinations.ai/', icon: 'fa-seedling', color: 'text-green-500' }
}

// --- TIERED AI MODELS ROSTER ---
export interface AIModel {
  id: string
  name: string
  provider: string
  type: 'text' | 'vision'
  tier: number
  url: string
  format: 'openai' | 'gemini'
}

export const AI_MODELS: AIModel[] = [
  // TEXT MODELS
  { id: 'llama-3.3-70b', name: 'Cerebras Llama 3.3', provider: 'cerebras', type: 'text', tier: 1, url: 'https://api.cerebras.ai/v1/chat/completions', format: 'openai' },
  { id: 'llama-3.3-70b-versatile', name: 'Groq Llama 3.3', provider: 'groq', type: 'text', tier: 1, url: 'https://api.groq.com/openai/v1/chat/completions', format: 'openai' },
  { id: 'Meta-Llama-3.1-405B-Instruct', name: 'SambaNova 405B', provider: 'sambanova', type: 'text', tier: 2, url: 'https://api.sambanova.ai/v1/chat/completions', format: 'openai' },
  { id: 'gpt-4o-mini', name: 'GitHub GPT-4o-Mini', provider: 'github', type: 'text', tier: 2, url: 'https://models.inference.ai.azure.com/chat/completions', format: 'openai' },
  { id: 'deepseek/deepseek-chat:free', name: 'OpenRouter DeepSeek', provider: 'openrouter', type: 'text', tier: 3, url: 'https://openrouter.ai/api/v1/chat/completions', format: 'openai' },
  { id: 'openai/gpt-4o-mini', name: 'Pollinations GPT-4o', provider: 'pollinations', type: 'text', tier: 4, url: 'https://text.pollinations.ai/openai/v1/chat/completions', format: 'openai' },

  // VISION & OCR MODELS
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', type: 'vision', tier: 1, url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', format: 'gemini' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'google', type: 'vision', tier: 1, url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', format: 'gemini' },
  { id: 'pixtral-12b-2409', name: 'Mistral Pixtral 12B', provider: 'mistral', type: 'vision', tier: 2, url: 'https://api.mistral.ai/v1/chat/completions', format: 'openai' },
  { id: 'Qwen/Qwen2.5-VL-72B-Instruct', name: 'HF Qwen 2.5 VL', provider: 'huggingface', type: 'vision', tier: 3, url: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-72B-Instruct/v1/chat/completions', format: 'openai' },
  { id: 'llama-3.2-11b-vision-preview', name: 'Groq Llama 3.2 Vision', provider: 'groq', type: 'vision', tier: 3, url: 'https://api.groq.com/openai/v1/chat/completions', format: 'openai' },
  { id: 'gpt-4o-mini', name: 'GitHub GPT-4o-Mini (Vision)', provider: 'github', type: 'vision', tier: 4, url: 'https://models.inference.ai.azure.com/chat/completions', format: 'openai' },
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'OpenRouter Gemini (Free)', provider: 'openrouter', type: 'vision', tier: 4, url: 'https://openrouter.ai/api/v1/chat/completions', format: 'openai' }
]

// --- ITEM CLASSIFICATION KEYS ---
export const ALCOHOL_KEYS = ['bia', 'rượu', 'vodka', 'soju', 'tiger', 'heineken', 'saigon', 'strongbow', 'hoegaarden']

export const DRINK_KEYS = ['coca', 'pepsi', '7up', 'trà', 'nước', 'soda', 'sting', 'red bull', 'lavi', 'aquafina', 'dasani', 'revive', 'fanta', 'sprite', 'summer', 'midnight', 'sunshine', 'passion', 'tháp', 'lon', 'chai', 'ly', 'jug', 'corona', 'budweiser', 'lemonade', 'blanc', 'vang', 'men', 'đào', 'vải', 'thuốc', 'craven', 'hero', 'jet', '555', 'esse']

// --- BANKS ---
export interface BankInfo {
  bin: string
  shortName: string
  name: string
}

export const BANKS: BankInfo[] = [
  { bin: '970415', shortName: 'VietinBank', name: 'TMCP Cong Thuong Viet Nam' },
  { bin: '970436', shortName: 'Vietcombank', name: 'TMCP Ngoai Thuong Viet Nam' },
  { bin: '970418', shortName: 'BIDV', name: 'TMCP Dau tu va Phat trien Viet Nam' },
  { bin: '970405', shortName: 'Agribank', name: 'Nong Nghiep va Phat trien Nong thon Viet Nam' },
  { bin: '970448', shortName: 'OCB', name: 'TMCP Phuong Dong' },
  { bin: '970422', shortName: 'MBBank', name: 'Quan Doi' },
  { bin: '970407', shortName: 'Techcombank', name: 'TMCP Ky Thuong Viet Nam' },
  { bin: '970416', shortName: 'ACB', name: 'TMCP A Chau' },
  { bin: '970432', shortName: 'VPBank', name: 'TMCP Viet Nam Thinh Vuong' },
  { bin: '970423', shortName: 'TPBank', name: 'TMCP Tien Phong' },
  { bin: '970403', shortName: 'Sacombank', name: 'TMCP Sai Gon Thuong Tin' },
  { bin: '970437', shortName: 'HDBank', name: 'TMCP Phat Trien TP.HCM' },
  { bin: '970454', shortName: 'VietCapitalBank', name: 'TMCP Ban Viet' },
  { bin: '970429', shortName: 'SCB', name: 'TMCP Sai Gon' },
  { bin: '970441', shortName: 'VIB', name: 'TMCP Quoc Te Viet Nam' },
  { bin: '970443', shortName: 'SHB', name: 'TMCP Sai Gon - Ha Noi' },
  { bin: '970431', shortName: 'Eximbank', name: 'TMCP Xuat Nhap Khau Viet Nam' },
  { bin: '970426', shortName: 'MSB', name: 'TMCP Hang Hai' },
  { bin: '546034', shortName: 'CAKE', name: 'Ngan hang so CAKE by VPBank' },
  { bin: '963388', shortName: 'Ubank', name: 'Ngan hang so Ubank by VPBank' },
  { bin: '888999', shortName: 'Timo', name: 'Ngan hang so Timo' },
  { bin: '970400', shortName: 'SaigonBank', name: 'TMCP Sai Gon Cong Thuong' },
  { bin: '970427', shortName: 'VietABank', name: 'TMCP Viet A' },
  { bin: '970428', shortName: 'NamABank', name: 'TMCP Nam A' },
  { bin: '970430', shortName: 'PGBank', name: 'TMCP Xang Dau Petrolimex' },
  { bin: '970449', shortName: 'LienVietPostBank', name: 'TMCP Buu Dien Lien Viet' },
  { bin: '970452', shortName: 'KienLongBank', name: 'TMCP Kien Long' },
  { bin: '970433', shortName: 'VietBank', name: 'TMCP Viet Nam Thuong Tin' },
  { bin: '970442', shortName: 'OceanBank', name: 'TM TNHH MTV Dai Duong' },
  { bin: '970434', shortName: 'PublicBank', name: 'TNHH MTV Public Viet Nam' },
  { bin: '970457', shortName: 'Woori', name: 'Woori Bank Viet Nam' },
  { bin: '970425', shortName: 'ABBANK', name: 'TMCP An Binh' },
  { bin: '970410', shortName: 'StandardChartered', name: 'TNHH MTV Standard Chartered Viet Nam' },
  { bin: '970409', shortName: 'BacABank', name: 'TMCP Bac A' },
  { bin: '970412', shortName: 'PVcomBank', name: 'TMCP Dai Chung Viet Nam' },
  { bin: '970424', shortName: 'ShinhanBank', name: 'TNHH MTV Shinhan Viet Nam' },
  { bin: '970440', shortName: 'SeABank', name: 'TMCP Dong Nam A' },
  { bin: '970406', shortName: 'DongABank', name: 'TMCP Dong A' },
  { bin: '970458', shortName: 'UOB', name: 'United Overseas Bank (Vietnam)' },
  { bin: '970419', shortName: 'NCB', name: 'TMCP Quoc Dan' },
  { bin: '970455', shortName: 'IVB', name: 'TNHH Indovina' },
  { bin: '970444', shortName: 'CBBank', name: 'TM TNHH MTV Xay Dung Viet Nam' },
  { bin: '970408', shortName: 'GPBank', name: 'TM TNHH MTV Dau Khi Toan Cau' },
  { bin: '970462', shortName: 'Kookmin', name: 'Kookmin Bank' },
  { bin: '970456', shortName: 'HSBC', name: 'HSBC (Vietnam)' },
  { bin: '970438', shortName: 'BaoVietBank', name: 'TMCP Bao Viet' },
  { bin: '970459', shortName: 'HongLeong', name: 'Hong Leong Bank Vietnam' },
  { bin: '970411', shortName: 'VRB', name: 'Lien doanh Viet - Nga' }
]

// --- SET COMBOS ---
export const SETS: Record<string, string> = {
  'SET 199K': 'Ba chỉ bò, Nầm heo, Chân gà rút xương, Kim chi, Rau',
  'SET 299K': 'Dẻ sườn bò, Lõi vai, Mực trứng, Bạch tuộc, Panchan',
  'COMBO 4 NGƯỜI': 'Lẩu Thái, 200g Bò, 200g Mực, Rau nấm tổng hợp'
}

// --- DEFAULT VALUES ---
export const DEFAULTS = {
  BANKS: '[{"bankId":"970457","name":"WOORI BANK","number":"104029411095","owner":"TRAN LE DUY","template":"compact"}]',
  STAFF: '[{"name":"Admin","phone":"0336667301"}]'
}

// --- CACHE KEYS ---
export const CACHE_KEYS = {
  MENU: 'kg_v400_menu',
  HISTORY: 'kg_v400_history',
  KEYS: 'kg_v400_keys_platforms',
  DEFAULTS: 'kg_v400_keys_defaults',
  BANK: 'kg_v400_banks',
  SELECTED_BANK: 'kg_v400_sel_bank',
  MENU_SHEET: 'kg_v400_menu_sheet',
  BRANDING: 'kg_v400_branding',
  STAFF: 'kg_v400_staff'
}

// --- SAMPLE MENU ---
export const SAMPLE_MENU = `KHAI VỊ
Khoai tây chiên - 45k
Ngô chiên - 45k
Salad cà chua dưa chuột - 55k

MÓN CHÍNH
Bò nướng tảng - 250k
Dẻ sườn bò Mỹ - 199k
Ba chỉ heo nướng - 120k

ĐỒ UỐNG
Coca - 15k
Bia Tiger - 25k
Rượu Vodka Men - 150k`

// --- ADVANCED AI PROMPT ---
export const ADVANCED_AI_PROMPT = `
VAI TRÒ: Bạn là AI Parser chuyên nghiệp (JSON Mode) của hệ thống King's Grill POS.
NHIỆM VỤ: Chuyển đổi văn bản tự nhiên hoặc OCR text thành JSON cấu trúc chuẩn xác 100%.

THÔNG TIN NGỮ CẢNH (CONTEXT):
- Thời gian hiện tại: {{CURRENT_TIME}} (Dùng để tính ngày "mai", "kia", "tuần sau")
- Menu hiện tại: 
{{MENU_CONTEXT}}

QUY TẮC CỐT LÕI (BẮT BUỘC):
1. Output Format: Chỉ trả về chuỗi JSON thuần. Tuyệt đối KHÔNG dùng Markdown (no \\\`\\\`\\\`json), KHÔNG giải thích.
2. Ngôn ngữ: Hiểu tiếng Việt, xử lý từ lóng (ng, slot, mạng, củ, k, lít).

QUY TẮC XỬ LÝ LOGIC (HARD RULES):

* 1. BÀN (TABLES):
  - Output bắt buộc: "{ZONE}{NUMBER}" (Viết liền, Zone in hoa).
  - Zone hợp lệ: [A, B, C, D, E, F, G].
  - Logic Mapping:
    + Có Zone + Số (VD: "Bàn B5", "Khu C bàn 2") -> Giữ nguyên ("B5", "C2").
    + Chỉ có Số (VD: "Bàn 5", "Vip 5", "ngồi số 5") -> Mặc định gán Zone A -> ("A5").
    + Chỉ có Zone (VD: "Ngồi khu C") -> Bỏ qua số bàn ("C").
    + Input rác ("bàn to", "bàn góc") -> Để trống.

* 2. SỐ LƯỢNG KHÁCH (PAX):
  - Chỉ lấy số nguyên (Integer).
  - Input: "10ng", "10 người", "10 pax" -> 10.
  - Input: "5 lớn 2 nhỏ" -> 7.
  - Input: "full bàn" -> Mặc định 6.

* 3. THỜI GIAN (TIME & DATE):
  - Date: Định dạng "dd/mm/yyyy". Tính toán dựa trên {{CURRENT_TIME}}.
  - Time: Định dạng ISO 24h "HH:mm".
    + "16g", "4h chiều" -> "16:00".
    + "7h tối", "19h30", "7 rưỡi" -> "19:30".
    + "trưa nay" -> "11:30" | "tối nay" -> "18:30".

* 4. MÓN ĂN (MENU ITEMS):
  - Tên món: Phải đối chiếu với Menu Context để sửa lỗi chính tả (VD: "heniken" -> "Heineken", "ba chỉ" -> "Ba chỉ heo nướng").
  - Số lượng: Nếu không rõ, mặc định là 1.
  - Set/Combo: Giữ nguyên tên Set (VD: "Set 199k"), ghi chú thêm vào field 'note'.

OUTPUT JSON SAMPLE:
{
  "customer": { 
    "name": "Tên Viết Hoa", 
    "phone": "0xxxxxxxxx", 
    "date": "dd/mm/yyyy", 
    "time": "HH:mm", 
    "pax": 0, 
    "tables": "A1", 
    "type": "Ăn thường", 
    "note": "" 
  },
  "menuItems": [ 
    { "name": "Tên Chuẩn", "qty": 1, "note": "ghi chú món" } 
  ]
}
`
