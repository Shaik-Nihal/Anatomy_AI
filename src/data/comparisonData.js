export const comparisonData = {
  Heart: {
    organName: "Heart",
    icon: "❤️",
    description: "Compare anatomical structures, chambers, and muscle profiles.",
    maleModel: "/models/human_heart.glb",
    femaleModel: "/models/human_heart.glb",
    healthyModel: "/models/human_heart.glb",
    diseasedModel: "/models/human_heart.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Heart",
      rightTitle: "Child Heart",
      leftStats: { heartRate: "60-100 bpm", weight: "250g - 350g", strokeVolume: "70 ml" },
      rightStats: { heartRate: "80-130 bpm", weight: "90g - 130g", strokeVolume: "15-20 ml" },
      leftNotes: "Fully developed myocardium with mature electrical conduction pathways. Lower resting heart rate.",
      rightNotes: "Smaller size with significantly higher resting heart rate to meet metabolic demands of growth. Myocardium is less compliant.",
      differences: [
        "Heart Rate: Children have a much higher resting heart rate compared to adults.",
        "Size & Weight: The child's heart is a fraction of the adult heart's weight.",
        "Stroke Volume: Pediatric hearts rely more on heart rate than stroke volume to increase cardiac output due to lower compliance."
      ],
      highlights: []
    }
  },
  Brain: {
    organName: "Brain",
    icon: "🧠",
    description: "Compare cerebral hemispheres, lobes, and tissue volumes.",
    maleModel: "/models/human_brain_cerebrum__brainstem.glb",
    femaleModel: "/models/human_brain_cerebrum__brainstem.glb",
    healthyModel: "/models/human_brain_cerebrum__brainstem.glb",
    diseasedModel: "/models/human_brain_cerebrum__brainstem.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Brain",
      rightTitle: "Child Brain",
      leftStats: { weight: "1.3 - 1.4 kg", plasticity: "Lower", myelination: "Complete" },
      rightStats: { weight: "1.0 - 1.2 kg", plasticity: "Very High", myelination: "Ongoing" },
      leftNotes: "Fully myelinated pathways with established neural networks. Prefrontal cortex is fully developed for complex decision-making.",
      rightNotes: "High neuroplasticity allowing rapid learning and adaptation. Myelination is still ongoing, especially in the prefrontal cortex.",
      differences: [
        "Neuroplasticity: Children's brains are highly adaptable and capable of rapid learning.",
        "Myelination: White matter tracks (myelin) are still developing in children, affecting processing speed.",
        "Prefrontal Cortex: Executive functions are still maturing in the child's brain."
      ],
      highlights: []
    }
  },
  Lungs: {
    organName: "Lungs",
    icon: "🫁",
    description: "Compare pulmonary volumes, capacities, and airway diameters.",
    maleModel: "/models/respiratory_system.glb",
    femaleModel: "/models/respiratory_system.glb",
    healthyModel: "/models/respiratory_system.glb",
    diseasedModel: "/models/respiratory_system.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Lungs",
      rightTitle: "Child Lungs",
      leftStats: { totalCapacity: "6.0 Liters", respiratoryRate: "12-20 breaths/min", alveoli: "300 Million" },
      rightStats: { totalCapacity: "1.5 - 2.5 Liters", respiratoryRate: "20-30 breaths/min", alveoli: "Developing" },
      leftNotes: "Fully developed alveoli and airways. Lower respiratory rate with high total lung capacity.",
      rightNotes: "Higher respiratory rate to meet oxygen demands. Alveoli continue to multiply and mature during early childhood.",
      differences: [
        "Alveolar Development: Children are still forming new alveoli, reaching adult numbers by around age 8.",
        "Respiratory Rate: Children breathe significantly faster than adults.",
        "Airway Resistance: Smaller airways in children lead to higher resistance and greater susceptibility to obstruction."
      ],
      highlights: []
    }
  },
  Eye: {
    organName: "Eye",
    icon: "👁️",
    description: "Compare axial length, corneal curve, and ocular structures.",
    maleModel: "/models/human_eye.glb",
    femaleModel: "/models/human_eye.glb",
    healthyModel: "/models/human_eye.glb",
    diseasedModel: "/models/human_eye.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Eye",
      rightTitle: "Child Eye",
      leftStats: { axialLength: "24 mm", lensFlexibility: "Decreasing", refractiveError: "Stable" },
      rightStats: { axialLength: "20 - 22 mm", lensFlexibility: "Very High", refractiveError: "Changing" },
      leftNotes: "Stable axial length and refractive power. The crystalline lens gradually loses flexibility (presbyopia) with age.",
      rightNotes: "Axial length increases as the child grows. The lens is highly flexible, allowing for excellent accommodation.",
      differences: [
        "Accommodation: Children have a highly flexible lens, allowing them to focus on very close objects effortlessly.",
        "Axial Growth: The eye grows in length during childhood.",
        "Visual Maturation: Visual pathways and binocular vision continue to develop in early childhood."
      ],
      highlights: []
    }
  },
  Skeleton: {
    organName: "Skeleton",
    icon: "🦴",
    description: "Compare bone density, pelvic shape, and structural integrity.",
    maleModel: "/models/ecorche_-_anatomy_study.glb",
    femaleModel: "/models/ecorche_-_anatomy_study.glb",
    healthyModel: "/models/ecorche_-_anatomy_study.glb",
    diseasedModel: "/models/ecorche_-_anatomy_study.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Skeleton",
      rightTitle: "Child Skeleton",
      leftStats: { boneComposition: "More Mineralized", growthPlates: "Closed", flexibility: "Lower" },
      rightStats: { boneComposition: "More Cartilage", growthPlates: "Open", flexibility: "Higher" },
      leftNotes: "Bones are fully ossified, strong, and brittle. Growth plates have fused.",
      rightNotes: "Bones contain more cartilage, making them more flexible and less likely to break completely.",
      differences: [
        "Growth Plates: Children have open epiphyseal plates at the ends of long bones for growth.",
        "Bone Composition: Pediatric bones are more porous and contain more cartilage.",
        "Healing Rate: Children's bones heal significantly faster than adult bones."
      ],
      highlights: []
    }
  },
  Liver: {
    organName: "Liver",
    icon: "/icons/liver.png",
    description: "Compare metabolic clearance rates, liver weight, and fibrotic status.",
    maleModel: "/models/liver.glb",
    femaleModel: "/models/liver.glb",
    healthyModel: "/models/liver.glb",
    diseasedModel: "/models/liver.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Liver",
      rightTitle: "Child Liver",
      leftStats: { relativeSize: "2% of body weight", metabolicEnzymes: "Mature", glycogenStorage: "High" },
      rightStats: { relativeSize: "4-5% of body weight", metabolicEnzymes: "Developing", glycogenStorage: "Limited" },
      leftNotes: "Standard metabolic enzyme activity and drug clearance rates. Robust glycogen storage capacity.",
      rightNotes: "Liver takes up a larger proportion of the abdominal cavity. Some metabolic pathways mature at different rates.",
      differences: [
        "Relative Size: The liver is proportionately much larger in infants and children than in adults.",
        "Drug Metabolism: Clearance rates for certain medications can be faster in children.",
        "Energy Reserves: Children have smaller glycogen stores, making them more prone to hypoglycemia."
      ],
      highlights: []
    }
  },
  Kidney: {
    organName: "Kidney",
    icon: "/icons/kidney.png",
    description: "Compare nephron numbers, glomerular size, and cystic structures.",
    maleModel: "/models/kidney.glb",
    femaleModel: "/models/kidney.glb",
    healthyModel: "/models/kidney.glb",
    diseasedModel: "/models/kidney.glb",
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
  ,
    ageComparison: {
      leftTitle: "Adult Kidney",
      rightTitle: "Child Kidney",
      leftStats: { gfrRate: "90-120 ml/min", concentratingAbility: "Maximal", size: "10-12 cm" },
      rightStats: { gfrRate: "Maturing", concentratingAbility: "Lower", size: "6-8 cm" },
      leftNotes: "Full functional capacity for filtration, secretion, and reabsorption.",
      rightNotes: "Kidneys grow in size and functional capacity. Infants have a lower ability to concentrate urine.",
      differences: [
        "Urine Concentration: Young children have a reduced capacity to concentrate urine, increasing dehydration risk.",
        "Filtration Rate: Glomerular filtration rate (GFR) reaches adult levels by around age 2.",
        "Size & Location: Kidneys are proportionately larger and sit slightly lower in the abdomen in infants."
      ],
      highlights: []
    }
  }
,

  Stomach: {
    organName: "Stomach",
    icon: "/icons/stomach.png",
    description: "Compare stomach structures and gastric conditions.",
    maleModel: "/models/realistic_human_stomach.glb",
    femaleModel: "/models/realistic_human_stomach.glb",
    healthyModel: "/models/realistic_human_stomach.glb",
    diseasedModel: "/models/realistic_human_stomach.glb",
    conditionComparison: {
      leftTitle: "Healthy Stomach",
      rightTitle: "Diseased Stomach (Ulcer)",
      leftStats: { pH: "1.5 - 3.5", mucosalLining: "Intact", digestion: "Normal" },
      rightStats: { pH: "Altered", mucosalLining: "Damaged", digestion: "Painful/Impaired" },
      leftNotes: "Thick mucous layer protects the stomach lining from its own acid.",
      rightNotes: "Breakdown of the mucosal barrier leading to an ulcer, often caused by H. pylori.",
      differences: [
        "Mucosal Barrier: Damaged in the diseased state.",
        "Tissue Inflammation: Present around the ulcer site."
      ],
      highlights: []
    }
  },
  Intestines: {
    organName: "Intestines",
    icon: "/icons/intestines.png",
    description: "Compare intestinal health and conditions.",
    maleModel: "/models/small_and_large_intestine.glb",
    femaleModel: "/models/small_and_large_intestine.glb",
    healthyModel: "/models/small_and_large_intestine.glb",
    diseasedModel: "/models/small_and_large_intestine.glb",
    conditionComparison: {
      leftTitle: "Healthy Intestines",
      rightTitle: "Diseased Intestines (Inflammation)",
      leftStats: { villi: "Intact", absorption: "High", lining: "Healthy" },
      rightStats: { villi: "Flattened", absorption: "Low", lining: "Inflamed" },
      leftNotes: "Maximal surface area for nutrient absorption.",
      rightNotes: "Inflammatory bowel conditions can damage the lining and impair absorption.",
      differences: [
        "Lining: Inflamed and damaged.",
        "Nutrient Absorption: Significantly reduced."
      ],
      highlights: []
    }
  },
  Skull: {
    organName: "Skull",
    icon: "💀",
    description: "Compare skull anatomy.",
    maleModel: "/models/human_male_skull.glb",
    femaleModel: "/models/human_male_skull.glb",
    healthyModel: "/models/human_male_skull.glb",
    diseasedModel: "/models/human_male_skull.glb",
    genderComparison: {
      leftTitle: "Male Skull",
      rightTitle: "Female Skull",
      leftStats: { size: "Larger", supraorbitalRidges: "Prominent", jawAngle: "Squarer" },
      rightStats: { size: "Smaller", supraorbitalRidges: "Smoother", jawAngle: "More Obtuse" },
      leftNotes: "Generally larger and more robust.",
      rightNotes: "Generally smaller and more gracile.",
      differences: [
        "Overall Robustness: Male skulls are typically more robust.",
        "Brow Ridges: More prominent in males."
      ],
      highlights: []
    }
  },
  "Human Anatomy": {
    organName: "Human Anatomy",
    icon: "/icons/human.png",
    description: "Full body anatomy overview.",
    maleModel: "/models/male_full_body_ecorche.glb",
    femaleModel: "/models/male_full_body_ecorche.glb",
    healthyModel: "/models/male_full_body_ecorche.glb",
    diseasedModel: "/models/male_full_body_ecorche.glb",
    conditionComparison: {
      leftTitle: "Healthy Anatomy",
      rightTitle: "Muscular Atrophy",
      leftStats: { muscleMass: "Normal", boneDensity: "Normal", posture: "Upright" },
      rightStats: { muscleMass: "Reduced", boneDensity: "Reduced", posture: "Weakened" },
      leftNotes: "Normal muscle tone and mass.",
      rightNotes: "Loss of muscle mass due to disuse or disease.",
      differences: [
        "Muscle Volume: Significantly reduced.",
        "Strength: Impaired."
      ],
      highlights: []
    }
  }

};
