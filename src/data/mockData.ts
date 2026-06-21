import type { CaseData, User } from "../types"

export const MOCK_USERS: User[] = [
  { id: "s1", name: "张小明", role: "student" },
  { id: "s2", name: "李婷婷", role: "student" },
  { id: "s3", name: "王大伟", role: "student" },
  { id: "t1", name: "陈老师", role: "teacher", password: "1234" },
  { id: "t2", name: "刘老师", role: "teacher", password: "1234" },
]

export const MOCK_CASES: CaseData[] = [
  {
    id: "masseter",
    name: "咬肌肥大",
    difficulty: 1,
    category: "瘦脸",
    patientAge: 32,
    patientGender: "女",
    chiefComplaint: "面下部宽大，希望瘦脸",
    injectionHistory: "6个月前曾在外院注射肉毒素，效果不满意",
    contraindications: ["对肉毒杆菌毒素过敏", "面部感染或炎症", "重症肌无力", "妊娠期或哺乳期"],
    anatomyHints: [
      "咬肌起自颧弓下缘，止于下颌骨外侧面",
      "注射点应位于咬肌隆起处，避开腮腺区",
      "注意避免注射过高导致笑肌无力",
      "安全区域：耳屏与口角连线中点下方1cm处",
    ],
    description: "患者女性，32岁，主诉面下部宽大，希望瘦脸。6个月前曾在外院注射肉毒素，效果不满意。查体：双侧咬肌肥大，左侧略大于右侧，咬合时咬肌隆起明显。",
    standardPoints: [
      { id: "m1", x: 160, y: 220, side: "bilateral", dose: 25, layer: "intramuscular", angle: 90, label: "咬肌隆起最高点" },
      { id: "m2", x: 145, y: 250, side: "bilateral", dose: 15, layer: "intramuscular", angle: 90, label: "咬肌后缘" },
      { id: "m3", x: 175, y: 245, side: "bilateral", dose: 10, layer: "intramuscular", angle: 90, label: "咬肌前缘" },
    ],
    dangerZones: [
      { id: "dz1", cx: 130, cy: 190, rx: 25, ry: 15, name: "腮腺区", warning: "腮腺区注射可能导致腮腺损伤和面部肿胀" },
      { id: "dz2", cx: 195, cy: 195, rx: 20, ry: 15, name: "笑肌区", warning: "注射过高可能影响笑肌功能，导致微笑不对称" },
      { id: "dz3", cx: 150, cy: 280, rx: 30, ry: 20, name: "面动脉区", warning: "面动脉走行区域，注意避开血管" },
    ],
  },
  {
    id: "tear-trough",
    name: "泪沟填充",
    difficulty: 2,
    category: "填充",
    patientAge: 38,
    patientGender: "女",
    chiefComplaint: "双侧泪沟凹陷，显得疲惫老态",
    injectionHistory: "1年前曾注射透明质酸填充泪沟，已吸收",
    contraindications: ["活动性眼部感染", "凝血功能障碍", "对透明质酸过敏", "近期做过眼部激光治疗"],
    anatomyHints: [
      "泪沟位于眶下缘内侧，由眶隔与眶骨膜之间的韧带牵拉形成",
      "注射层次应在骨膜上，避开眶隔内结构",
      "注意避开眼动脉和滑车动脉",
      "推荐使用钝针扇形注射技术",
    ],
    description: "患者女性，38岁，主诉双侧泪沟凹陷，显得疲惫老态。1年前曾注射透明质酸填充泪沟，效果尚可但已吸收。查体：双侧泪沟凹陷，Glogau分级II级，皮肤弹性尚可。",
    standardPoints: [
      { id: "t1", x: 160, y: 150, side: "bilateral", dose: 0.3, layer: "subcutaneous", angle: 30, label: "泪沟内侧起点" },
      { id: "t2", x: 155, y: 165, side: "bilateral", dose: 0.2, layer: "subcutaneous", angle: 30, label: "泪沟中段" },
      { id: "t3", x: 150, y: 178, side: "bilateral", dose: 0.1, layer: "subcutaneous", angle: 30, label: "泪沟外侧终点" },
    ],
    dangerZones: [
      { id: "dz4", cx: 145, cy: 140, rx: 20, ry: 15, name: "眶隔区", warning: "注射过深可能进入眶隔，导致眼球压迫" },
      { id: "dz5", cx: 140, cy: 165, rx: 15, ry: 12, name: "滑车动脉区", warning: "滑车动脉走行区域，盲注可能导致血管栓塞" },
      { id: "dz6", cx: 170, cy: 145, rx: 18, ry: 12, name: "眶下动脉区", warning: "眶下动脉穿出点附近，注意回抽确认" },
    ],
  },
  {
    id: "glabellar",
    name: "眉间纹改善",
    difficulty: 2,
    category: "除皱",
    patientAge: 45,
    patientGender: "女",
    chiefComplaint: "眉间纵行皱纹明显，皱眉时加重",
    injectionHistory: "无注射史",
    contraindications: ["对肉毒杆菌毒素过敏", "面部感染", "重症肌无力", "使用氨基糖苷类抗生素", "妊娠期"],
    anatomyHints: [
      "眉间纹由皱眉肌和降眉肌收缩产生",
      "皱眉肌起自眉弓内端，止于眉部皮肤",
      "降眉肌起自鼻骨，止于眉间皮肤",
      "注意避开滑车上血管和眶上血管",
    ],
    description: "患者女性，45岁，主诉眉间纵行皱纹明显，皱眉时加重。无注射史。查体：眉间2-3条纵行皱纹，静止时可见，皱眉时加深，周边皮肤弹性一般。",
    standardPoints: [
      { id: "g1", x: 155, y: 130, side: "bilateral", dose: 10, layer: "intramuscular", angle: 90, label: "皱眉肌内侧点" },
      { id: "g2", x: 148, y: 135, side: "left", dose: 5, layer: "intramuscular", angle: 90, label: "左皱眉肌外侧点" },
      { id: "g3", x: 162, y: 135, side: "right", dose: 5, layer: "intramuscular", angle: 90, label: "右皱眉肌外侧点" },
      { id: "g4", x: 155, y: 148, side: "bilateral", dose: 5, layer: "intramuscular", angle: 45, label: "降眉肌点" },
    ],
    dangerZones: [
      { id: "dz7", cx: 155, cy: 120, rx: 18, ry: 10, name: "眶上缘", warning: "注射过低可能影响提上睑肌，导致上睑下垂" },
      { id: "dz8", cx: 140, cy: 130, rx: 12, ry: 12, name: "滑车上动脉", warning: "滑车上血管走行区，注意回抽" },
      { id: "dz9", cx: 170, cy: 130, rx: 12, ry: 12, name: "眶上动脉", warning: "眶上血管穿出点，避免血管内注射" },
    ],
  },
]
