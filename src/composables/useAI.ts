import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useAppStore } from '@/stores/useAppStore'
import { parseJSON, resizeImage, stripAccents, formatVND, formatSetNote } from '@/utils'
import { AI_MODELS, SETS, ADVANCED_AI_PROMPT, IMAGE_OCR_PROMPT } from '@/utils/constants'
import type { AIModel } from '@/utils/constants'

/**
 * AI Core v4.0 - Smart Routing & Synergy Orchestration
 */
export function useAI() {
  const uiStore = useUIStore()
  const formStore = useFormStore()
  const configStore = useConfigStore()
  const appStore = useAppStore()

  /** Core Call Logic mapped by Provider Format */
  async function callAIModel(model: AIModel, sysPrompt: string, userPrompt: string, image: string | null = null): Promise<string | null> {
    const keys = configStore.keys[model.provider] || []
    if (keys.length === 0 && model.provider !== 'pollinations') {
      throw new Error(`Thiếu API Key cho nền tảng ${model.provider}`)
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      try {
        let url = model.url
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        let body: any = {}

        if (key !== 'free') headers['Authorization'] = `Bearer ${key}`
        if (model.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.href
          headers['X-Title'] = "King's Grill Manager"
        }

        if (model.format === 'gemini') {
          url += `?key=${key}`
          delete headers['Authorization']
          body = {
            contents: [{
              parts: [
                { text: sysPrompt + '\n\nUser Input:\n' + userPrompt },
                ...(image ? [{ inline_data: { mime_type: 'image/jpeg', data: image.split(',')[1] } }] : [])
              ]
            }]
          }
        } else if (model.format === 'openai') {
          let msgContent: any = userPrompt
          if (image) {
            msgContent = [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
          body = {
            model: model.id,
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: msgContent }
            ],
            ...(model.provider !== 'pollinations' ? { response_format: { type: 'json_object' } } : {})
          }
        }

        let fetchUrl = url
        let fetchHeaders = { ...headers }
        const r2Url = import.meta.env.VITE_R2_URL

        if (model.format === 'openai' || model.format === 'gemini') {
           if (r2Url && !url.includes('pollinations')) {
             fetchUrl = `${r2Url}/ai-proxy`
             fetchHeaders['x-target-url'] = url
             if (model.format === 'gemini') {
               fetchHeaders['x-gemini-key'] = key
               delete fetchHeaders['Authorization']
             }
           } else if (model.format === 'gemini') {
             fetchUrl += `?key=${key}`
           }
        }

        const res = await fetch(fetchUrl, { method: 'POST', headers: fetchHeaders, body: JSON.stringify(body) })
        if (res.status === 429) throw new Error('Rate limit / Quota exceeded')
        if (!res.ok) throw new Error(await res.text())

        const json = await res.json()
        return model.format === 'gemini'
          ? json.candidates?.[0]?.content?.parts?.[0]?.text
          : json.choices?.[0]?.message?.content
      } catch (e: any) {
        console.warn(`Key ${i + 1}/${keys.length} of ${model.provider} failed: ${e.message}`)
        if (i === keys.length - 1) throw e
      }
    }
    return null
  }

  /** Synergy: Fix Malformed JSON via Text Model */
  async function repairMalformedJSON(badString: string): Promise<any> {
    uiStore.loading.subMsg = 'Synergy: Fixing JSON Error...'
    const repairPrompt = `Bạn là JSON Fixer. Dữ liệu sau bị lỗi cú pháp JSON. Hãy sửa lại cho chuẩn xác 100% (chỉ trả về JSON thuần): \n\n${badString}`
    const repairModel = AI_MODELS.find(m => m.id === configStore.defaults.text) || configStore.textModels[0]
    const fixedStr = await callAIModel(repairModel, 'Chỉ trả về JSON', repairPrompt)
    return parseJSON(fixedStr || '')
  }

  /** Smart Pipeline Router (Waterfall) */
  async function smartRouter(type: 'text' | 'vision', sysPrompt: string, userPrompt: string, image: string | null = null) {
    let candidates: AIModel[] = []
    const defaultModelId = type === 'vision' ? configStore.defaults.vision : configStore.defaults.text

    // 1. Put Default Model First
    const defaultModel = AI_MODELS.find(m => m.id === defaultModelId)
    if (defaultModel) candidates.push(defaultModel)

    // 2. Append rest by Tier
    const rest = AI_MODELS.filter(m => m.type === type && m.id !== defaultModelId).sort((a, b) => a.tier - b.tier)
    candidates = [...candidates, ...rest]

    // Filter to models with configured keys
    candidates = candidates.filter(m =>
      m.provider === 'pollinations' || (configStore.keys[m.provider] && configStore.keys[m.provider].length > 0)
    )

    if (candidates.length === 0) {
      throw new Error(`Không có API Key nào được cấu hình cho xử lý ${type.toUpperCase()}`)
    }

    let fallbackCount = 0
    let lastError: Error | null = null
    const startTime = performance.now()

    for (const model of candidates) {
      try {
        uiStore.loading.subMsg = `ROUTING: ${model.name}...`
        const rawResult = await callAIModel(model, sysPrompt, userPrompt, image)

        let parsedJSON = parseJSON(rawResult || '')

        // Trigger Synergy Repair if parse failed but we got text
        if (!parsedJSON && rawResult) {
          parsedJSON = await repairMalformedJSON(rawResult)
        }

        if (parsedJSON) {
          const latency = ((performance.now() - startTime) / 1000).toFixed(1)
          return {
            data: parsedJSON,
            metadata: {
              processedBy: model.name,
              latency,
              fallbackCount
            }
          }
        } else {
          throw new Error('Lỗi trích xuất JSON')
        }
      } catch (e: any) {
        console.warn(`Model ${model.name} failed. Routing to next...`)
        fallbackCount++
        lastError = e
      }
    }
    throw new Error('Pipeline thất bại. Lỗi cuối: ' + (lastError?.message || 'Unknown'))
  }

  /** Main AI Processing Orchestrator */
  async function processAI() {
    if (!formStore.rawInput && !formStore.aiImage) {
      return uiStore.showToast('Nhập văn bản hoặc tải ảnh!', 'warning')
    }

    uiStore.loading.is = true
    uiStore.loading.msg = 'AI CORE V4.0 RUNNING...'
    uiStore.loading.subMsg = 'Initializing...'

    try {
      const menuContext = appStore.menuList.map((i: any) => {
        const desc = i.desc ? ` - ${i.desc}` : ''
        return `- ${i.name} (${formatVND(i.price)})${desc}`
      }).join('\n')

      const systemPrompt = ADVANCED_AI_PROMPT
        .replace('{{MENU_CONTEXT}}', menuContext)
        .replace('{{CURRENT_TIME}}', new Date().toLocaleString('vi-VN'))

      const type = formStore.aiImage ? 'vision' : 'text'
      const optimizedImg = formStore.aiImage ? await resizeImage(formStore.aiImage, 1024) : null
      const promptText = formStore.aiImage 
        ? `Phân tích ảnh menu/bill này để lấy thông tin đặt bàn.${formStore.rawInput ? ' Ghi chú bổ sung từ người dùng:\n' + formStore.rawInput : ''}` 
        : formStore.rawInput

      const aiResponse = await smartRouter(type, systemPrompt, promptText, optimizedImg)

      if (aiResponse?.data) {
        const result = aiResponse.data
        const meta = aiResponse.metadata

        if (result.customer) {
          Object.assign(formStore.customer, result.customer)

          if (result.customer.tables) {
            const match = result.customer.tables.match(/^([A-E])(\d+)$/i)
            if (match) {
              uiStore.tempTable.zone = match[1].toUpperCase()
              uiStore.tempTable.number = match[2]
            } else {
              const num = result.customer.tables.replace(/\D/g, '')
              if (num) uiStore.tempTable.number = num
            }
          }
        }

        if (result.menuItems) {
          formStore.items = result.menuItems.map((item: any) => {
            const normName = stripAccents(item.name).toLowerCase()
            const menuMatch = appStore.menuList.find((m: any) => m.cleanName === normName || m.acronym === normName)
            let note = item.note || ''
            if (menuMatch) {
              if (appStore.menuDetails[menuMatch.name]) note = appStore.menuDetails[menuMatch.name]
              else if (SETS[menuMatch.name.toUpperCase()]) note = SETS[menuMatch.name.toUpperCase()]
            }
            if (note && (note.includes(',') || menuMatch)) note = formatSetNote(note)

            return {
              name: menuMatch ? menuMatch.name : item.name,
              price: menuMatch ? menuMatch.price : 0,
              qty: item.qty || 1,
              note
            }
          })
        }

        uiStore.showToast(
          `<b>Thành công ⚡</b><br/>Xử lý bởi: <span class="text-indigo-600">${meta.processedBy}</span><br/>Tốc độ: ${meta.latency}s | Fallback: ${meta.fallbackCount}`,
          'success', 4000
        )
        formStore.aiMetadata = meta
      }
    } catch (e: any) {
      uiStore.error.show = true
      uiStore.error.msg = 'AI Pipeline Error: ' + e.message
    } finally {
      uiStore.loading.is = false
    }
  }

  /** Verify Transfer Image via AI Vision */
  async function verifyTransferImage(base64Img: string) {
    uiStore.loading.is = true
    uiStore.loading.msg = 'AI ĐANG KIỂM TRA BILL CK...'
    uiStore.loading.subMsg = 'Financial Analysis...'
    try {
      const expectedAmount = formStore.deposit.amount
      const sysPrompt = `Bạn là AI Kế Toán của King's Grill. Nhiệm vụ: Trích xuất chính xác thông tin từ ảnh chuyển khoản ngân hàng.
Output JSON format: { "amount": Number, "content": "String", "bank": "String", "time": "String" }
Yêu cầu:
- amount: Chỉ lấy số tiền chuyển thành công (VD: 500000). Bỏ qua số dư.
- content: Nội dung/Lời nhắn chuyển tiền.
- Nếu không tìm thấy, trả về null.`

      const aiResponse = await smartRouter('vision', sysPrompt, 'Phân tích ảnh này', base64Img)
      const result = aiResponse.data

      if (result?.amount) {
        const aiAmount = parseInt(result.amount)
        const aiContent = result.content || ''
        const isAmountMatch = aiAmount === parseInt(String(expectedAmount))

        if (isAmountMatch) {
          formStore.deposit.isPaid = true
          formStore.deposit.note = aiContent || 'AI Verified: Khớp số tiền'
          formStore.deposit.time = result.time || new Date().toLocaleString('vi-VN')
          uiStore.showToast(`✅ Đã xác thực thành công!\nSố tiền: ${formatVND(aiAmount)}\nNội dung: ${aiContent}`, 'success')
        } else {
          uiStore.verifyModal.show = true
          uiStore.verifyModal.scanned = { amount: aiAmount, content: aiContent }
          uiStore.verifyModal.expected = { amount: expectedAmount }
        }
      } else {
        throw new Error('Không đọc được thông tin chuyển khoản.')
      }
    } catch (e: any) {
      uiStore.showToast('Lỗi xác thực: ' + e.message + '\nVui lòng kiểm tra thủ công.', 'warning')
    } finally {
      uiStore.loading.is = false
    }
  }

  /**
   * OCR: Extract raw text from image (Step 1 of 2-step flow)
   * Returns plain text (not JSON) for user review before parsing
   */
  async function ocrExtractText(base64Img: string): Promise<string> {
    uiStore.loading.is = true
    uiStore.loading.msg = 'AI OCR ĐANG ĐỌC ẢNH...'
    uiStore.loading.subMsg = 'Vision Processing...'

    try {
      const optimizedImg = await resizeImage(base64Img, 1280)

      // Find vision models with available keys, sorted by tier
      let candidates: AIModel[] = []
      const defaultVisionId = configStore.defaults.vision
      const defaultModel = AI_MODELS.find(m => m.id === defaultVisionId)
      if (defaultModel) candidates.push(defaultModel)

      const rest = AI_MODELS.filter(m => m.type === 'vision' && m.id !== defaultVisionId).sort((a, b) => a.tier - b.tier)
      candidates = [...candidates, ...rest]
      candidates = candidates.filter(m =>
        m.provider === 'pollinations' || (configStore.keys[m.provider] && configStore.keys[m.provider].length > 0)
      )

      if (candidates.length === 0) {
        throw new Error('Không có API Key nào được cấu hình cho Vision/OCR')
      }

      const startTime = performance.now()
      let lastError: Error | null = null

      for (const model of candidates) {
        try {
          uiStore.loading.subMsg = `OCR via ${model.name}...`

          // Call the model but extract raw text (not JSON)
          const rawResult = await callAIModel(model, IMAGE_OCR_PROMPT, 'Trích xuất toàn bộ văn bản từ ảnh này.', optimizedImg)

          if (rawResult && rawResult.trim().length > 10) {
            const latency = ((performance.now() - startTime) / 1000).toFixed(1)

            // Clean up the result - remove markdown code blocks if any
            let cleanText = rawResult.trim()
            cleanText = cleanText.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1').trim()

            uiStore.showToast(
              `<b>OCR Thành công ⚡</b><br/>Model: <span class="text-indigo-600">${model.name}</span><br/>Tốc độ: ${latency}s`,
              'success', 3000
            )

            return cleanText
          } else {
            throw new Error('OCR trả về kết quả rỗng')
          }
        } catch (e: any) {
          console.warn(`OCR Model ${model.name} failed:`, e.message)
          lastError = e
        }
      }

      throw new Error('OCR pipeline thất bại: ' + (lastError?.message || 'Unknown'))
    } finally {
      uiStore.loading.is = false
    }
  }

  return {
    callAIModel,
    repairMalformedJSON,
    smartRouter,
    processAI,
    verifyTransferImage,
    ocrExtractText
  }
}
