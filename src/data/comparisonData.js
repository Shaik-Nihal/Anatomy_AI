export const comparisonData = {
  Heart: {
    organName: "Heart",
    icon: "❤️",
    description: "Compare anatomical structures, chambers, and muscle profiles.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Heart",
      rightTitle: "Female Heart",
      leftStats: { weight: "300g - 350g", volume: "280ml", wallThickness: "12mm" },
      rightStats: { weight: "250g - 300g", volume: "220ml", wallThickness: "10mm" },
      leftNotes: "Typically larger in total mass and ventricular volume due to larger average body surface area. Left ventricular mass is proportional to fat-free body mass.",
      rightNotes: "Smaller average size, but has a higher resting heart rate (average 78-82 bpm) to maintain comparable cardiac output despite smaller stroke volume.",
      differences: [
        "Mass & Volume: Male heart is about 15-20% heavier and has larger ventricular cavity volumes.",
        "Stroke Volume: Female heart has a smaller stroke volume, compensated by a slightly higher resting heart rate.",
        "QT Interval: Electrocardiographic intervals (specifically corrected QT interval) are typically longer in adult females."
      ],
      highlights: [
        { part: "Left Ventricle", label: "Larger Myocardial Mass in Males", color: "#3B82F6" },
        { part: "Right Ventricle", label: "Greater Cavity Volume in Males", color: "#3B82F6" }
      ]
    },
    conditionComparison: {
      leftTitle: "Healthy Heart",
      rightTitle: "Diseased Heart",
      leftStats: { ejectionFraction: "55% - 70%", bloodPressure: "120/80 mmHg", coronaryFlow: "Normal (250 ml/min)" },
      rightStats: { ejectionFraction: "30% - 40% (Reduced)", bloodPressure: "150/95 mmHg (Hypertension)", coronaryFlow: "Restricted (Atherosclerosis)" },
      leftNotes: "Normal myocardium with regular electrical conduction. Coronary arteries are wide and flexible, allowing unrestricted oxygen supply during exertion.",
      rightNotes: "Myocardial infarction (necrosis) in the left ventricle wall due to coronary artery disease. Shows myocardial thinning and fibrous scar tissue formation.",
      differences: [
        "Coronary Blockage: Diseased heart has atheromatous plaque blocking left anterior descending (LAD) artery.",
        "Myocardial Necrosis: Necrotic, non-functional tissue in the apex zone of the left ventricle.",
        "Ejection Fraction: Seriously diminished ejection efficiency (under 40%), leading to early-stage congestive failure."
      ],
      highlights: [
        { part: "Aorta", label: "Coronary Arterial Plaque & Calcification", color: "#EF4444" },
        { part: "Myocardium / Heart Wall", label: "Infarcted Necrotic Apical Zone", color: "#F59E0B" }
      ]
    }
  },
  Brain: {
    organName: "Brain",
    icon: "🧠",
    description: "Compare cerebral hemispheres, lobes, and tissue volumes.",
    maleModel: "/src/models/Brain.glb",
    femaleModel: "/src/models/Brain.glb",
    healthyModel: "/src/models/Brain.glb",
    diseasedModel: "/src/models/Brain.glb",
    genderComparison: {
      leftTitle: "Male Brain",
      rightTitle: "Female Brain",
      leftStats: { volume: "1,274 cm³", grayMatterRatio: "40%", whiteMatterRatio: "60%" },
      rightStats: { volume: "1,131 cm³", grayMatterRatio: "45%", whiteMatterRatio: "55%" },
      leftNotes: "Larger overall cranial volume (about 10% larger on average, correlating with body size), with a higher proportion of white matter (myelinated nerve fibers).",
      rightNotes: "Higher density of gray matter (neuronal cell bodies) and relative cortical thickness. Shows higher connectivity across hemispheres.",
      differences: [
        "Cranial Volume: Male brain volume is average 10% larger, matching height and weight scaling.",
        "Hemispheric Connectivity: Female brains show greater inter-hemispheric (between hemispheres) connectivity, while male brains show greater intra-hemispheric connectivity.",
        "Gray/White Matter Ratio: Females have a higher percentage of gray matter; males have a higher percentage of white matter."
      ],
      highlights: [
        { part: "Cerebral Cortex", label: "Greater Cortical Thickness in Females", color: "#EC4899" },
        { part: "Cerebellum", label: "Larger Average Cerebellar Volume in Males", color: "#3B82F6" }
      ]
    },
    conditionComparison: {
      leftTitle: "Healthy Brain",
      rightTitle: "Diseased Brain",
      leftStats: { ventricles: "Normal Size", atrophyIndex: "0% (None)", cerebralBloodFlow: "50 ml/100g/min" },
      rightStats: { ventricles: "Severely Enlarged", atrophyIndex: "35% (Severe)", cerebralBloodFlow: "32 ml/100g/min (Reduced)" },
      leftNotes: "Full cortical volume, normal sulci and gyri dimensions. Hippocampal structures are intact, supporting active synaptic plasticity and memory formation.",
      rightNotes: "Displays severe cerebral atrophy, widened sulci, and enlarged ventricles characteristic of Alzheimer's disease. Severe neuronal loss in hippocampal lobes.",
      differences: [
        "Cortical Atrophy: Significant thinning of the gray matter and narrowing of the gyri (folds).",
        "Ventriculomegaly: Expansion of lateral ventricles due to surrounding brain tissue loss.",
        "Hippocampal Shrinkage: Severe cell loss in the temporal lobe, causing memory consolidation failure."
      ],
      highlights: [
        { part: "Temporal Lobe", label: "Severe Hippocampal Shrinkage & Loss", color: "#EF4444" },
        { part: "Cerebral Cortex", label: "Widened Sulci and Cortical Atrophy", color: "#F59E0B" }
      ]
    }
  },
  Lungs: {
    organName: "Lungs",
    icon: "🫁",
    description: "Compare pulmonary volumes, capacities, and airway diameters.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Lungs",
      rightTitle: "Female Lungs",
      leftStats: { totalCapacity: "6.0 Liters", surfaceArea: "80 m²", airwayDiameter: "Normal" },
      rightStats: { totalCapacity: "4.7 Liters", surfaceArea: "65 m²", airwayDiameter: "Slightly Smaller" },
      leftNotes: "Larger vital capacity and larger alveolar surface area, yielding a higher peak expiratory flow rate on average, matching larger thoracic cage size.",
      rightNotes: "Smaller lung volumes and narrower airways, even when corrected for height, resulting in higher airway resistance and differing ventilation patterns.",
      differences: [
        "Total Lung Capacity: Male lungs have approx. 20-25% larger volume capacity.",
        "Airway Caliber: Females have smaller trachea and bronchi diameters relative to lung volume (dysanapsis).",
        "Ventilatory Reserve: Females exhibit smaller ventilatory reserve during strenuous exercise."
      ],
      highlights: []
    },
    conditionComparison: {
      leftTitle: "Healthy Lung",
      rightTitle: "Diseased Lung (COPD)",
      leftStats: { fev1FvcRatio: "80%", elasticRecoil: "High", alveolarSepta: "Intact" },
      rightStats: { fev1FvcRatio: "45% (Obstructed)", elasticRecoil: "Severely Reduced", alveolarSepta: "Damaged (Emphysema)" },
      leftNotes: "Pink, elastic tissue. Alveolar sacs are thin-walled and fully intact, facilitating rapid gas exchange of oxygen and carbon dioxide.",
      rightNotes: "Darkened carbonaceous tissue. Displays loss of alveolar septa (emphysema) and hypersecretion of mucus in airways, causing chronic obstruction.",
      differences: [
        "Alveolar Destruction: Alveolar walls break down, creating large air spaces with reduced surface area.",
        "Airway Obstruction: Bronchial inflammation and excess mucus restrict airflow (low FEV1/FVC).",
        "Tissue Discoloration: Accumulation of carbon deposits and inflammatory debris."
      ],
      highlights: []
    }
  },
  Eye: {
    organName: "Eye",
    icon: "👁️",
    description: "Compare axial length, corneal curve, and ocular structures.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Eye",
      rightTitle: "Female Eye",
      leftStats: { axialLength: "24.2 mm", cornealDiameter: "11.8 mm", macularThickness: "Normal" },
      rightStats: { axialLength: "23.7 mm", cornealDiameter: "11.6 mm", macularThickness: "Slightly Thinner" },
      leftNotes: "Larger globe volume and longer axial length on average, resulting in minor differences in refractive tendencies and ocular measurements.",
      rightNotes: "Slightly shorter axial length. Tend to have a slightly steeper corneal curvature on average and higher susceptibility to angle-closure glaucoma.",
      differences: [
        "Axial Length: Males have a slightly longer eye length (axial length) on average.",
        "Corneal Curvature: Females have slightly steeper corneas.",
        "Prevalence: Dry eye disease is significantly more common in females due to hormonal factors."
      ],
      highlights: []
    },
    conditionComparison: {
      leftTitle: "Normal Eye",
      rightTitle: "Diseased Eye (Cataract)",
      leftStats: { lensClarity: "100% Clear", intraocularPressure: "12-15 mmHg", visualAcuity: "20/20" },
      rightStats: { lensClarity: "Cloudy / Opaque", intraocularPressure: "18 mmHg", visualAcuity: "20/100 (Reduced)" },
      leftNotes: "Transparent crystalline lens focusing light directly onto the fovea of the retina. Normal aqueous humor drainage.",
      rightNotes: "The crystalline lens contains clumped proteins, creating opacities (cataracts) that scatter light, preventing clear focus on the retina.",
      differences: [
        "Lens Opacification: Accumulation of yellow-brown pigment and protein clumping inside the lens.",
        "Light Scattering: Light rays scatter instead of focusing, leading to blurry vision and glare.",
        "Contrast Sensitivity: Drastic drop in color perception and low-contrast details."
      ],
      highlights: []
    }
  },
  Skeleton: {
    organName: "Skeleton",
    icon: "🦴",
    description: "Compare bone density, pelvic shape, and structural integrity.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Skeleton",
      rightTitle: "Female Skeleton",
      leftStats: { boneMass: "Higher", pelvisInlet: "Heart-shaped", subpubicAngle: "60 - 70 degrees" },
      rightStats: { boneMass: "Lower", pelvisInlet: "Oval/Round", subpubicAngle: "80 - 90 degrees (Wider)" },
      leftNotes: "Typically heavier, thicker bones with more pronounced muscular attachment ridges. The pelvis is narrow, deep, and heavy.",
      rightNotes: "Bones are lighter and thinner. The pelvis is adapted for childbirth: wider, shallower, and lighter, with a wider subpubic angle.",
      differences: [
        "Pelvic Structure: Female pelvis is wider and shallower, with a rounder pelvic inlet to allow childbirth.",
        "Subpubic Angle: Female subpubic angle is obtuse (>80°), whereas the male angle is acute (<70°).",
        "Bone Thickness: Males generally have thicker cortical bone and higher overall bone mineral density."
      ],
      highlights: []
    },
    conditionComparison: {
      leftTitle: "Healthy Bone",
      rightTitle: "Diseased Bone (Osteoporosis)",
      leftStats: { boneMineralDensity: "T-Score > -1.0", trabecularStructure: "Thick & Connected", fractureRisk: "Low" },
      rightStats: { boneMineralDensity: "T-Score < -2.5 (Severe)", trabecularStructure: "Thin & Perforated", fractureRisk: "High" },
      leftNotes: "Strong cortical bone layer with dense, interconnected spongy bone (trabecular network) holding minerals like calcium.",
      rightNotes: "Spongy bone has lost massive trabecular connections, showing large micro-architectural gaps and brittle thinness.",
      differences: [
        "Micro-architectural Decay: Perforation and loss of connections within the trabecular bone plates.",
        "Thinning Cortex: The outer compact bone (cortex) becomes thinner and more porous.",
        "Fracture Susceptibility: Significant risk of low-trauma fractures, especially in the hip, spine, and wrist."
      ],
      highlights: []
    }
  },
  Liver: {
    organName: "Liver",
    icon: "🩺",
    description: "Compare metabolic clearance rates, liver weight, and fibrotic status.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Liver",
      rightTitle: "Female Liver",
      leftStats: { liverWeight: "1.4 - 1.8 kg", liverVolume: "1500 ml", metabolismRate: "Slower (Relative)" },
      rightStats: { liverWeight: "1.2 - 1.4 kg", liverVolume: "1200 ml", metabolismRate: "Faster (Relative)" },
      leftNotes: "Larger size and weight on average, matching body volume. Shows differences in cytochrome P450 enzyme expression patterns.",
      rightNotes: "Smaller absolute mass. Higher relative perfusion per gram of tissue. Demonstrates different clearance rates for certain medications.",
      differences: [
        "Organ Weight: Male liver is 15-20% heavier on average.",
        "Enzymatic Activity: Genders express different baseline levels of metabolic enzymes, impacting drug processing.",
        "Hormonal Influence: Estrogen levels in females influence hepatic lipid metabolism and bile acid synthesis."
      ],
      highlights: []
    },
    conditionComparison: {
      leftTitle: "Healthy Liver",
      rightTitle: "Diseased Liver (Cirrhosis)",
      leftStats: { fatContent: "< 5%", surfaceTexture: "Smooth & Red-brown", compliance: "Elastic / Soft" },
      rightStats: { fatContent: "> 30% (Steatosis)", surfaceTexture: "Nodular & Fibrotic", compliance: "Rigid / Hard" },
      leftNotes: "Homogeneous tissue, elastic parenchymal texture, normal portal vein pressures. Functions normally in filtering blood.",
      rightNotes: "Widespread nodules surrounded by thick bands of fibrous scar tissue. Shows signs of severe congestion and hepatocyte necrosis.",
      differences: [
        "Nodular Regeneration: Hepatocytes regenerate in disorganized clumps separated by fibrotic scars.",
        "Fibrosis: Deposition of extracellular matrix proteins (collagen) by activated stellate cells.",
        "Portal Hypertension: Hardening of liver tissue obstructs portal blood flow, increasing vascular resistance."
      ],
      highlights: []
    }
  },
  Kidney: {
    organName: "Kidney",
    icon: "🩸",
    description: "Compare nephron numbers, glomerular size, and cystic structures.",
    maleModel: "/src/models/Heart1.glb",
    femaleModel: "/src/models/Heart1.glb",
    healthyModel: "/src/models/Heart1.glb",
    diseasedModel: "/src/models/Heart1.glb",
    genderComparison: {
      leftTitle: "Male Kidney",
      rightTitle: "Female Kidney",
      leftStats: { kidneyWeight: "125 - 170g", length: "11.2 cm", nephronNumber: "Approx. 1.1 million" },
      rightStats: { kidneyWeight: "115 - 155g", length: "10.9 cm", nephronNumber: "Approx. 1.0 million" },
      leftNotes: "Slightly larger dimensions. Higher glomerular filtration rate (GFR) in absolute terms, correlating with larger body surface area.",
      rightNotes: "Slightly smaller size. The GFR is lower in absolute numbers, but equivalent when normalized to body surface area.",
      differences: [
        "Kidney Mass: Male kidneys have slightly larger dimensions and weight.",
        "Glomerular Size: Glomeruli are larger on average in males.",
        "Hormonal Protection: Estrogen may offer protective benefits against progressive renal disease pathways."
      ],
      highlights: []
    },
    conditionComparison: {
      leftTitle: "Healthy Kidney",
      rightTitle: "Diseased Kidney (Polycystic)",
      leftStats: { cortexThickness: "1.5 cm", cystCount: "0", gfrRate: "90-120 ml/min" },
      rightStats: { cortexThickness: "Compressed / Thin", cystCount: "Hundreds (Fluid-filled)", gfrRate: "15 ml/min (Failure)" },
      leftNotes: "Smooth capsule. Normal cortical-medullary definition with intact nephrons filtering waste from renal arteries.",
      rightNotes: "Massively enlarged kidney filled with hundreds of fluid-accumulating cysts that destroy the surrounding healthy nephrons.",
      differences: [
        "Cyst Expansion: Cysts develop in nephrons and expand, compressing and destroying functional parenchyma.",
        "Renal Enlargement: The organ expands up to 5-10 times its normal size, losing bean shape.",
        "GFR Reduction: Filtration drops drastically, leading to uremia and requiring dialysis."
      ],
      highlights: []
    }
  }
};
