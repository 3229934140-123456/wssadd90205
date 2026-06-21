import { useState } from "react"
import { X, ChevronDown, Copy, Check, Eye } from "lucide-react"

const ATLAS_ITEMS = [
  {
    id: "muscle",
    title: "面部肌肉分布",
    svg: (
      <svg viewBox="0 0 200 260" className="h-full w-full">
        <ellipse cx="100" cy="120" rx="70" ry="95" fill="#FDE8D8" stroke="#D4A07A" strokeWidth="1.5" />
        <ellipse cx="75" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <ellipse cx="125" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <circle cx="75" cy="100" r="4" fill="#4A3728" />
        <circle cx="125" cy="100" r="4" fill="#4A3728" />
        <path d="M60 75 Q75 65 90 75" fill="none" stroke="#B85C38" strokeWidth="1.5" />
        <path d="M110 75 Q125 65 140 75" fill="none" stroke="#B85C38" strokeWidth="1.5" />
        <path d="M55 90 Q50 120 55 150" fill="none" stroke="#C47045" strokeWidth="1.2" />
        <path d="M145 90 Q150 120 145 150" fill="none" stroke="#C47045" strokeWidth="1.2" />
        <path d="M70 140 Q100 155 130 140" fill="none" stroke="#C47045" strokeWidth="1.2" />
        <path d="M80 130 Q100 135 120 130" fill="none" stroke="#C47045" strokeWidth="1" />
        <path d="M90 160 Q100 180 110 160" fill="none" stroke="#C47045" strokeWidth="1.2" />
        <path d="M65 130 Q55 145 65 160" fill="none" stroke="#B85C38" strokeWidth="1" />
        <path d="M135 130 Q145 145 135 160" fill="none" stroke="#B85C38" strokeWidth="1" />
        <path d="M50 110 Q45 130 55 150" fill="none" stroke="#B85C38" strokeWidth="1" />
        <path d="M150 110 Q155 130 145 150" fill="none" stroke="#B85C38" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "nerve",
    title: "面部神经分布",
    svg: (
      <svg viewBox="0 0 200 260" className="h-full w-full">
        <ellipse cx="100" cy="120" rx="70" ry="95" fill="#FDE8D8" stroke="#D4A07A" strokeWidth="1.5" />
        <ellipse cx="75" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <ellipse cx="125" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <circle cx="75" cy="100" r="4" fill="#4A3728" />
        <circle cx="125" cy="100" r="4" fill="#4A3728" />
        <path d="M100 60 Q100 80 85 95" fill="none" stroke="#EAB308" strokeWidth="1.8" />
        <path d="M100 60 Q80 70 65 90" fill="none" stroke="#EAB308" strokeWidth="1.5" />
        <path d="M100 60 Q120 70 135 90" fill="none" stroke="#EAB308" strokeWidth="1.5" />
        <path d="M85 95 Q70 100 55 110" fill="none" stroke="#EAB308" strokeWidth="1.2" />
        <path d="M85 95 Q80 105 70 120" fill="none" stroke="#EAB308" strokeWidth="1.2" />
        <path d="M135 90 Q150 100 155 115" fill="none" stroke="#EAB308" strokeWidth="1.2" />
        <path d="M135 90 Q130 105 125 120" fill="none" stroke="#EAB308" strokeWidth="1.2" />
        <path d="M65 90 Q55 80 45 75" fill="none" stroke="#EAB308" strokeWidth="1" />
        <path d="M65 90 Q60 100 55 110" fill="none" stroke="#EAB308" strokeWidth="1" />
        <path d="M70 120 Q75 135 85 145" fill="none" stroke="#EAB308" strokeWidth="1" />
        <path d="M125 120 Q120 135 110 145" fill="none" stroke="#EAB308" strokeWidth="1" />
        <path d="M100 60 Q100 50 95 40" fill="none" stroke="#EAB308" strokeWidth="1.2" />
        <path d="M100 60 Q110 50 115 42" fill="none" stroke="#EAB308" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "vessel",
    title: "面部血管分布",
    svg: (
      <svg viewBox="0 0 200 260" className="h-full w-full">
        <ellipse cx="100" cy="120" rx="70" ry="95" fill="#FDE8D8" stroke="#D4A07A" strokeWidth="1.5" />
        <ellipse cx="75" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <ellipse cx="125" cy="100" rx="12" ry="8" fill="white" stroke="#D4A07A" strokeWidth="1" />
        <circle cx="75" cy="100" r="4" fill="#4A3728" />
        <circle cx="125" cy="100" r="4" fill="#4A3728" />
        <path d="M100 45 Q100 70 95 90" fill="none" stroke="#DC2626" strokeWidth="2" />
        <path d="M95 90 Q90 105 85 120" fill="none" stroke="#DC2626" strokeWidth="1.8" />
        <path d="M85 120 Q82 140 85 160" fill="none" stroke="#DC2626" strokeWidth="1.5" />
        <path d="M85 160 Q90 175 100 185" fill="none" stroke="#DC2626" strokeWidth="1.2" />
        <path d="M95 90 Q110 85 130 90" fill="none" stroke="#DC2626" strokeWidth="1.2" />
        <path d="M95 90 Q75 85 60 90" fill="none" stroke="#DC2626" strokeWidth="1.2" />
        <path d="M60 90 Q45 85 35 80" fill="none" stroke="#DC2626" strokeWidth="1" />
        <path d="M130 90 Q145 85 155 80" fill="none" stroke="#DC2626" strokeWidth="1" />
        <path d="M85 120 Q70 125 55 130" fill="none" stroke="#DC2626" strokeWidth="1" />
        <path d="M85 120 Q100 125 115 130" fill="none" stroke="#DC2626" strokeWidth="1" />
        <circle cx="95" cy="90" r="3" fill="#DC2626" />
        <circle cx="85" cy="120" r="3" fill="#DC2626" />
      </svg>
    ),
  },
  {
    id: "bone",
    title: "面部骨骼结构",
    svg: (
      <svg viewBox="0 0 200 260" className="h-full w-full">
        <ellipse cx="100" cy="120" rx="70" ry="95" fill="#FDE8D8" stroke="#D4A07A" strokeWidth="1.5" />
        <path d="M55 75 L75 65 L100 60 L125 65 L145 75" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <ellipse cx="75" cy="100" rx="15" ry="12" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <ellipse cx="125" cy="100" rx="15" ry="12" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M40 100 Q50 80 75 70" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M160 100 Q150 80 125 70" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M55 95 L55 115" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M145 95 L145 115" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M65 130 Q100 120 135 130" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M75 135 L85 155" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M125 135 L115 155" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M85 155 Q100 165 115 155" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M45 130 Q50 140 55 150" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M155 130 Q150 140 145 150" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
      </svg>
    ),
  },
]

const CONTRAINDICATIONS = [
  {
    id: "botox",
    title: "肉毒毒素注射禁忌",
    items: ["对肉毒杆菌毒素或辅料过敏", "重症肌无力或Lambert-Eaton综合征", "注射部位感染或炎症", "妊娠期或哺乳期", "使用氨基糖苷类抗生素", "凝血功能障碍或使用抗凝药物"],
  },
  {
    id: "ha",
    title: "透明质酸填充禁忌",
    items: ["对透明质酸或交联剂过敏", "注射部位活动性感染（如疱疹）", "凝血功能障碍", "近期做过激光或化学剥脱", "自身免疫性疾病活动期", "瘢痕体质倾向"],
  },
  {
    id: "danger",
    title: "面部危险区域",
    items: ["眉间区 — 滑车上/眶上血管，盲注可致失明", "鼻区 — 鼻背动脉与眼动脉吻合", "颞区 — 颞浅动脉及其分支", "眶周 — 眼动脉系统，血管栓塞高风险", "鼻唇沟 — 面动脉走行", "唇部 — 上/下唇动脉"],
  },
  {
    id: "complication",
    title: "常见并发症处理",
    items: ["血管栓塞：立即停止注射，注射透明质酸酶，热敷按摩", "血肿：即刻压迫冰敷，24小时后热敷促进吸收", "过敏反应：轻者抗组胺药，重者肾上腺素", "肉毒毒素弥散：等待自然恢复，约3-6个月", "结节/硬块：按摩、注射溶解酶"],
  },
  {
    id: "special",
    title: "特殊人群注意事项",
    items: ["孕妇及哺乳期：禁止注射肉毒毒素及填充", "未成年人：不建议进行美容注射", "老年人：皮肤薄、血管脆，减量缓慢注射", "瘢痕体质：慎重评估，避免创伤性操作", "免疫抑制患者：感染风险高，需预防性抗感染"],
  },
]

const RECORD_TEMPLATE = `患者姓名：__________  性别：____  年龄：____
就诊日期：__________  病历号：__________

注射部位：____________________
使用产品：□ 肉毒毒素  □ 透明质酸  □ 其他：______
产品批号：__________  有效期：__________

| 部位 | 剂量(U/mL) | 层次 | 进针角度 | 备注 |
|------|-----------|------|---------|------|
|      |           |      |         |      |
|      |           |      |         |      |
|      |           |      |         |      |

注射层次说明：□ 皮内  □ 皮下  □ 肌层
进针角度：□ 15°  □ 30°  □ 45°  □ 90°

术后医嘱：
1. 注射后24小时内避免按压揉搓
2. 4小时内保持直立位
3. 1周内避免剧烈运动及桑拿
4. 2周后复诊评估效果

医师签名：__________  日期：__________`

export default function Resources() {
  const [expandedAtlas, setExpandedAtlas] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(RECORD_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const selectedAtlas = ATLAS_ITEMS.find((a) => a.id === expandedAtlas)

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B]">资料库</h1>
          <p className="mt-1 text-sm text-gray-500">解剖图谱、注射层次、禁忌速查与标准模板</p>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">解剖图集</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ATLAS_ITEMS.map((item) => (
              <div key={item.id} onClick={() => setExpandedAtlas(item.id)} className="cursor-pointer rounded-xl border-2 border-transparent bg-white p-3 shadow-sm transition-all hover:border-[#0F766E] hover:shadow-md">
                <div className="mb-2 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[#F0F4F8]">
                  {item.svg}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1E293B]">{item.title}</span>
                  <Eye size={14} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedAtlas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setExpandedAtlas(null)}>
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setExpandedAtlas(null)} className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600">
                <X size={20} />
              </button>
              <h3 className="mb-4 text-lg font-semibold text-[#1E293B]">{selectedAtlas.title}</h3>
              <div className="flex justify-center">{selectedAtlas.svg}</div>
            </div>
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">注射层次示意</h2>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <svg viewBox="0 0 400 280" className="mx-auto h-auto w-full max-w-md">
              <rect x="40" y="20" width="320" height="40" fill="#FBBF24" rx="4" />
              <text x="200" y="45" textAnchor="middle" fill="#78350F" fontSize="14" fontWeight="600">表皮</text>
              <rect x="40" y="60" width="320" height="60" fill="#FDE68A" rx="4" />
              <text x="200" y="95" textAnchor="middle" fill="#78350F" fontSize="14" fontWeight="600">真皮</text>
              <rect x="40" y="120" width="320" height="50" fill="#FCD34D" opacity="0.5" rx="4" />
              <text x="200" y="150" textAnchor="middle" fill="#78350F" fontSize="14" fontWeight="600">皮下组织</text>
              <rect x="40" y="170" width="320" height="50" fill="#FB923C" opacity="0.5" rx="4" />
              <text x="200" y="200" textAnchor="middle" fill="#7C2D12" fontSize="14" fontWeight="600">肌肉</text>
              <rect x="40" y="220" width="320" height="40" fill="#D1D5DB" rx="4" />
              <text x="200" y="245" textAnchor="middle" fill="#374151" fontSize="14" fontWeight="600">骨膜</text>
              <line x1="375" y1="40" x2="390" y2="40" stroke="#0F766E" strokeWidth="2" />
              <text x="395" y="44" fill="#0F766E" fontSize="11" fontWeight="500">皮内</text>
              <line x1="375" y1="145" x2="390" y2="145" stroke="#0F766E" strokeWidth="2" />
              <text x="395" y="149" fill="#0F766E" fontSize="11" fontWeight="500">皮下</text>
              <line x1="375" y1="195" x2="390" y2="195" stroke="#0F766E" strokeWidth="2" />
              <text x="395" y="199" fill="#0F766E" fontSize="11" fontWeight="500">肌层</text>
            </svg>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">禁忌速查</h2>
          <div className="space-y-2">
            {CONTRAINDICATIONS.map((item) => (
              <div key={item.id} className="rounded-xl bg-white shadow-sm">
                <button onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)} className="flex w-full items-center justify-between p-4 text-left">
                  <span className="font-medium text-[#1E293B]">{item.title}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${openAccordion === item.id ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === item.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                    <ul className="space-y-1.5">
                      {item.items.map((text, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F97066]" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#1E293B]">标准记录模板</h2>
          <div className="relative rounded-xl bg-white p-6 shadow-sm">
            <button onClick={handleCopy} className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50">
              {copied ? <Check size={14} className="text-[#0F766E]" /> : <Copy size={14} />}
              {copied ? "已复制" : "复制"}
            </button>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#1E293B] p-4 font-mono text-sm leading-relaxed text-gray-300">
              {RECORD_TEMPLATE}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
