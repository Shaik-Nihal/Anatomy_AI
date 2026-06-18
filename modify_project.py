import re
import os

# 1. Update comparisonData.js
data_path = 'src/data/comparisonData.js'
with open(data_path, 'r') as f:
    content = f.read()

age_data = {
    'Heart': '''    ageComparison: {
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
    }''',
    'Brain': '''    ageComparison: {
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
    }''',
    'Lungs': '''    ageComparison: {
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
    }''',
    'Eye': '''    ageComparison: {
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
    }''',
    'Skeleton': '''    ageComparison: {
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
    }''',
    'Liver': '''    ageComparison: {
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
    }''',
    'Kidney': '''    ageComparison: {
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
    }'''
}

for organ, age_comp in age_data.items():
    pattern = r'(' + organ + r': \{.*?conditionComparison: \{.*?highlights: \[.*?\]\s*\}\s*)(\},|\}\n)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        replacement = match.group(1) + ',\n' + age_comp + '\n  ' + match.group(2)
        content = content[:match.start()] + replacement + content[match.end():]

with open(data_path, 'w') as f:
    f.write(content)

# 2. Update ComparisonViewer.jsx
viewer_path = 'src/pages/Comparison/ComparisonViewer.jsx'
with open(viewer_path, 'r') as f:
    viewer_content = f.read()

# heartRateType="fast"
fast_beat = '''      } else if (heartRateType === "fast") {
        const t = (elapsed * 2.2) % 2.0;
        if (t < 0.2) {
          offset = Math.sin((t / 0.2) * Math.PI) * 0.06;
        } else if (t >= 0.25 && t < 0.45) {
          offset = Math.sin(((t - 0.25) / 0.2) * Math.PI) * 0.09;
        }
      }'''
viewer_content = viewer_content.replace(
    '} else if (heartRateType === "arrhythmia") {',
    fast_beat + '\n      } else if (heartRateType === "arrhythmia") {'
)

# activeTab = "gender" -> activeTab = "gender" | "condition" | "age"
viewer_content = viewer_content.replace('useState("gender"); // "gender" | "condition"', 'useState("gender"); // "gender" | "condition" | "age"')

# currentTab
viewer_content = viewer_content.replace(
    'const currentTab = activeTab === "gender" ? data.genderComparison : data.conditionComparison;',
    'const currentTab = activeTab === "gender" ? data.genderComparison : (activeTab === "condition" ? data.conditionComparison : data.ageComparison);'
)

# rightScale
viewer_content = viewer_content.replace(
    'const rightScale = activeTab === "gender" ? baseScale * 0.85 : baseScale;',
    'const rightScale = activeTab === "gender" ? baseScale * 0.85 : (activeTab === "age" ? baseScale * 0.65 : baseScale);'
)

# Tab buttons
tabs_replacement = '''      <div className="tab-selector">
        <button
          onClick={() => {
            setActiveTab("gender");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "gender" ? "active-gender" : ""}`}
        >
          Male vs Female
        </button>
        <button
          onClick={() => {
            setActiveTab("condition");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "condition" ? "active-condition" : ""}`}
        >
          Healthy vs Diseased
        </button>
        <button
          onClick={() => {
            setActiveTab("age");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "age" ? "active-age" : ""}`}
        >
          Adult vs Child
        </button>
      </div>'''
viewer_content = re.sub(r'<div className="tab-selector">.*?</div>', tabs_replacement, viewer_content, flags=re.DOTALL)

# Left Viewport Badge
viewer_content = viewer_content.replace(
    'span className={`viewport-badge ${activeTab === "gender" ? "badge-male" : "badge-healthy"}`}',
    'span className={`viewport-badge ${activeTab === "gender" ? "badge-male" : (activeTab === "condition" ? "badge-healthy" : "badge-adult")}`}'
)

# Right Viewport Badge
viewer_content = viewer_content.replace(
    'span className={`viewport-badge ${activeTab === "gender" ? "badge-female" : "badge-diseased"}`}',
    'span className={`viewport-badge ${activeTab === "gender" ? "badge-female" : (activeTab === "condition" ? "badge-diseased" : "badge-child")}`}'
)

# ComparativeModel Right HeartRateType
viewer_content = viewer_content.replace(
    'heartRateType={activeTab === "gender" ? "normal" : "arrhythmia"}',
    'heartRateType={activeTab === "gender" ? "normal" : (activeTab === "condition" ? "arrhythmia" : "fast")}'
)

# Stats Card Title Left
viewer_content = viewer_content.replace(
    'h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-left-gender" : "stats-title-left-condition"}`}',
    'h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-left-gender" : (activeTab === "condition" ? "stats-title-left-condition" : "stats-title-left-age")}`}'
)

# Stats Card Title Right
viewer_content = viewer_content.replace(
    'h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-right-gender" : "stats-title-right-condition"}`}',
    'h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-right-gender" : (activeTab === "condition" ? "stats-title-right-condition" : "stats-title-right-age")}`}'
)

with open(viewer_path, 'w') as f:
    f.write(viewer_content)

print("Modification complete.")
