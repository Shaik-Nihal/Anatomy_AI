import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

// Comprehensive Educational Dataset for Organs and their Parts
const educationalContent = {
  Heart: {
    general: {
      anatomy: "The heart is a muscular organ about the size of a closed fist, located in the mediastinum of the thoracic cavity. It is divided into four chambers: two upper atria and two lower ventricles, separated by a septum. The main role of the heart is to pump deoxygenated blood to the lungs and oxygenated blood to the rest of the body.",
      module: {
        title: "Introduction to Cardiovascular Hemodynamics",
        sections: [
          {
            heading: "Double Circulation System",
            text: "Human circulation consists of the Pulmonary Circuit (right ventricle pumps oxygen-poor blood to the lungs) and the Systemic Circuit (left ventricle pumps oxygen-rich blood to systemic capillaries)."
          },
          {
            heading: "The Cardiac Cycle",
            text: "Each heartbeat consists of Diastole (ventricles relax and fill with blood) and Systole (ventricles contract and eject blood into arteries). This cycle is strictly regulated by intrinsic electrical impulses."
          },
          {
            heading: "Clinical Importance",
            text: "Understanding cardiac output (stroke volume × heart rate) is fundamental to assessing heart failure, valvular dysfunction, and hypertension."
          }
        ],
        articles: [
          { title: "NIH: Physiology of the Heart", url: "https://www.ncbi.nlm.nih.gov/books/NBK470364/" },
          { title: "Kenhub: Anatomy of the Human Heart", url: "https://www.kenhub.com/en/library/anatomy/the-heart" }
        ]
      },
      video: "7XadFvjL-tQ" // Heart anatomy video
    },
    "Aorta": {
      anatomy: "The Aorta is the largest artery in the human body, arising directly from the left ventricle. It curves upwards (ascending aorta), arches back (aortic arch), and descends through the chest (thoracic aorta) and abdomen (abdominal aorta) before dividing.",
      module: {
        title: "Hemodynamics of the Great Vessel",
        sections: [
          {
            heading: "Structural Compliance & Windkessel Effect",
            text: "The aorta has highly elastic walls. During systole, it expands to store energy from the ejected blood. During diastole, the elastic recoil pushes the blood forward, maintaining a continuous flow."
          },
          {
            heading: "Clinical Correlation: Aortic Aneurysm & Dissection",
            text: "Chronic blood pressure load or structural weaknesses (Marfan syndrome) can lead to tearing of the inner aortic wall layer (dissection) or life-threatening dilation (aneurysm)."
          }
        ],
        articles: [
          { title: "MedlinePlus: Aortic Dissection Clinical Review", url: "https://medlineplus.gov/ency/article/000181.htm" },
          { title: "PubMed: Histology and Pathophysiology of the Aorta", url: "https://www.ncbi.nlm.nih.gov/books/NBK537130/" }
        ]
      },
      video: "l8bUryfX2XQ" // Aorta physiology video
    },
    "Left Ventricle": {
      anatomy: "The Left Ventricle has walls that are three times thicker than the right ventricle. It receives oxygenated blood from the left atrium through the mitral valve and ejects it through the aortic valve into the systemic circulation.",
      module: {
        title: "Ventricular Mechanics & Systemic Workload",
        sections: [
          {
            heading: "Myocardial Wall Thickness",
            text: "The thickness of the left ventricular myocardium is an adaptation to the high resistance of the systemic circulation, which requires pressures up to 120 mmHg (compared to ~25 mmHg in the lungs)."
          },
          {
            heading: "Left Ventricular Hypertrophy (LVH)",
            text: "Chronic workload elevation (hypertension, aortic stenosis) causes the muscle fibers to thicken, decreasing compliance and eventually leading to diastolic heart failure."
          }
        ],
        articles: [
          { title: "NIH: Left Ventricular Function and Assessment", url: "https://www.ncbi.nlm.nih.gov/books/NBK532296/" },
          { title: "Kenhub: Left Ventricle Structure & Relations", url: "https://www.kenhub.com/en/library/anatomy/left-ventricle" }
        ]
      },
      video: "cphZlRk08iM" // Left Ventricle video
    },
    "Right Ventricle": {
      anatomy: "The Right Ventricle is crescent-shaped in cross section and lies anteriorly. It receives deoxygenated blood from the right atrium through the tricuspid valve and pumps it through the pulmonary valve into the pulmonary artery.",
      module: {
        title: "Pulmonary Circulation Dynamics",
        sections: [
          {
            heading: "Low-Pressure System Ejection",
            text: "Since pulmonary vascular resistance is very low, the right ventricle operates as a volume pump rather than a pressure pump, requiring far less muscular wall thickness."
          },
          {
            heading: "Cor Pulmonale",
            text: "Chronic lung diseases (like COPD) raise pulmonary arterial pressure, forcing the right ventricle to work harder, eventually leading to right-sided heart failure (Cor Pulmonale)."
          }
        ],
        articles: [
          { title: "NIH: Right Ventricular Heart Failure", url: "https://www.ncbi.nlm.nih.gov/books/NBK430851/" },
          { title: "Kenhub: Right Ventricle Anatomy & Valves", url: "https://www.kenhub.com/en/library/anatomy/right-ventricle" }
        ]
      },
      video: "vD_vswJ6670"
    },
    "Left Atrium": {
      anatomy: "The Left Atrium forms most of the base of the heart. It receives oxygenated blood from the lungs via four pulmonary veins and pumps it into the left ventricle.",
      module: {
        title: "Atrial Filling & Conduction Dynamics",
        sections: [
          {
            heading: "Mitral Inflow & Active Atrial Kick",
            text: "Approximately 80% of blood flows passively into the left ventricle. The remaining 20% is delivered by active contraction of the atrium, known as the 'atrial kick'."
          },
          {
            heading: "Atrial Fibrillation (AFib)",
            text: "Rapid, disorganized electrical impulses cause the atrium to quiver rather than contract, eliminating the atrial kick and increasing the risk of blood clots and stroke."
          }
        ],
        articles: [
          { title: "CDC: Atrial Fibrillation Overview", url: "https://www.cdc.gov/heartdisease/atrial_fibrillation.htm" }
        ]
      },
      video: "2N-P3B3W5d4"
    },
    "Right Atrium": {
      anatomy: "The Right Atrium receives deoxygenated blood returning from the body tissues via the Superior Vena Cava (upper body), Inferior Vena Cava (lower body), and Coronary Sinus (heart tissues).",
      module: {
        title: "Venous Return and PACEMAKER Hub",
        sections: [
          {
            heading: "The Sinoatrial (SA) Node",
            text: "Located in the superior wall of the right atrium, the SA node is the natural pacemaker. It spontaneously generates electrical impulses that spread across the atria to trigger contraction."
          },
          {
            heading: "Intravascular Pressure Monitoring",
            text: "Right atrial pressure is equivalent to Central Venous Pressure (CVP). It acts as a primary index of circulating blood volume and venous tone."
          }
        ],
        articles: [
          { title: "NIH: Sinoatrial Node Conductive Pathway", url: "https://www.ncbi.nlm.nih.gov/books/NBK545199/" }
        ]
      },
      video: "Ew2o39o3WnI"
    },
    "Pulmonary Artery": {
      anatomy: "The Pulmonary Artery (or Trunk) emerges from the right ventricle and splits into the left and right pulmonary arteries, carrying deoxygenated blood to the lungs.",
      module: {
        title: "Functional Anatomy of Pulmonary Trunk",
        sections: [
          {
            heading: "Deoxygenated Blood Transport",
            text: "Unlike systemic arteries, the pulmonary arteries carry blood low in oxygen and high in carbon dioxide to facilitate gas exchange in the alveolar capillary beds."
          },
          {
            heading: "Pulmonary Embolism (PE)",
            text: "A blood clot traveling from deep leg veins (DVT) can block the pulmonary artery, stopping gas exchange and leading to acute right ventricular strain or sudden arrest."
          }
        ],
        articles: [
          { title: "MedlinePlus: Pulmonary Embolism Guides", url: "https://medlineplus.gov/pulmonaryembolism.html" }
        ]
      },
      video: "J7D1h6S1Ksw"
    },
    "Myocardium / Heart Wall": {
      anatomy: "The Myocardium is the middle muscular layer of the heart wall. It consists of specialized branching cardiac muscle cells (cardiomyocytes) linked by intercalated discs.",
      module: {
        title: "Syncytium Electrophysiology",
        sections: [
          {
            heading: "Intercalated Discs & Gap Junctions",
            text: "These structures connect cardiac cells mechanically and electrically. They allow action potentials to spread rapidly, ensuring the heart contracts as a single unified unit (functional syncytium)."
          },
          {
            heading: "Myocardial Infarction (Heart Attack)",
            text: "Occlusion of coronary arteries cuts off oxygen supply, leading to ischemia and cell death of myocardial fibers, which are replaced by non-contractile scar tissue."
          }
        ],
        articles: [
          { title: "NIH: Histology of the Myocardium", url: "https://www.ncbi.nlm.nih.gov/books/NBK535359/" }
        ]
      },
      video: "n8Qz02v1Pps"
    }
  },
  Brain: {
    general: {
      anatomy: "The human brain is the central organ of the nervous system, weighing about 1.4 kg. It is housed within the cranium and is composed of the cerebrum, cerebellum, and brainstem. It consists of billions of neurons and glial cells that coordinate thought, action, sensory processing, and autonomic regulatory pathways.",
      module: {
        title: "Neurobiological Organization & Cerebrospinal Fluid",
        sections: [
          {
            heading: "Cerebral Hemispheres & Lateralization",
            text: "The brain is split into left and right hemispheres connected by the corpus callosum. The left side is generally associated with speech and logic, while the right handles visual-spatial processing."
          },
          {
            heading: "Protective Layers and CSF Flow",
            text: "The brain is protected by three meningeal membranes (dura, arachnoid, and pia mater). Cerebrospinal fluid (CSF) circulates in the subarachnoid space, providing buoyancy and waste clearance."
          },
          {
            heading: "Vascular Supply & Blood-Brain Barrier (BBB)",
            text: "The brain uses 20% of the body's oxygen. Capillary endothelial cells form a tight barrier (BBB) that shields neural tissues from harmful blood-borne substances."
          }
        ],
        articles: [
          { title: "NIH: Brain Anatomy & Function Overview", url: "https://www.ncbi.nlm.nih.gov/books/NBK542179/" },
          { title: "Kenhub: Human Brain Structure Atlas", url: "https://www.kenhub.com/en/library/anatomy/the-brain" }
        ]
      },
      video: "Qzd7a_xT2k0" // general brain lobes video
    },
    "Frontal Lobe": {
      anatomy: "The Frontal Lobe is the largest lobe of the cerebral cortex, situated at the front of each hemisphere. It includes the prefrontal cortex, premotor area, and primary motor cortex.",
      module: {
        title: "Executive Cognition & Motor Control",
        sections: [
          {
            heading: "The Prefrontal Cortex",
            text: "Responsible for higher cognitive processes: decision-making, planning, problem-solving, personality expression, and social behavior controls."
          },
          {
            heading: "Broca's Area & Primary Motor Stripe",
            text: "Broca's area (usually in the left hemisphere) handles speech production. The motor strip controls voluntary skeletal muscle actions across the body."
          },
          {
            heading: "Clinical Damage: Phineas Gage Case",
            text: "Tearing or injury of frontal lobe pathways alters personality, limits impulse control, and severely disrupts executive reasoning capacity."
          }
        ],
        articles: [
          { title: "NIH: The Frontal Lobe Functional Mapping", url: "https://www.ncbi.nlm.nih.gov/books/NBK539829/" }
        ]
      },
      video: "F70OzEU5Z10"
    },
    "Parietal Lobe": {
      anatomy: "The Parietal Lobe is positioned posterior to the frontal lobe. It contains the primary somatosensory cortex which processes sensations from body tissues.",
      module: {
        title: "Sensory Integration and Homunculus Mapping",
        sections: [
          {
            heading: "Somatosensory Cortex (Postcentral Gyrus)",
            text: "Decodes signals for touch, temperature, pressure, and pain. It is mapped as a sensory homunculus, where highly sensitive regions (fingertips, lips) occupy larger cortical areas."
          },
          {
            heading: "Spatial Processing and Gerstmann's Syndrome",
            text: "It integrates sensory inputs into spatial awareness. Damage to the dominant parietal lobe can cause agraphia (inability to write) and acalculia (inability to compute)."
          }
        ],
        articles: [
          { title: "NIH: Parietal Lobe Assessment Guide", url: "https://www.ncbi.nlm.nih.gov/books/NBK559092/" }
        ]
      },
      video: "pX3K0rL6W3o"
    },
    "Occipital Lobe": {
      anatomy: "The Occipital Lobe is the visual processing center of the brain, located in the posterior-most region of the cerebral cortex, housing the primary visual cortex (V1).",
      module: {
        title: "Cortical Visual Processing Pathways",
        sections: [
          {
            heading: "Primary Visual Cortex (V1)",
            text: "Receives inputs from the eyes via the lateral geniculate nucleus (LGN) of the thalamus, extracting basic orientations, shapes, and colors."
          },
          {
            heading: "Ventral and Dorsal Streams",
            text: "Visual data travels through two pathways: the 'What' pathway (ventral stream, identifies shapes/objects) and the 'Where/How' pathway (dorsal stream, tracks spatial motion)."
          },
          {
            heading: "Cortical Blindness",
            text: "Damage to the occipital lobe can result in loss of conscious vision, even if the eyes and optic nerves are fully healthy."
          }
        ],
        articles: [
          { title: "PubMed: Cortical Visual Pathway Systems", url: "https://www.ncbi.nlm.nih.gov/books/NBK544321/" }
        ]
      },
      video: "zBvBsh55HIE"
    },
    "Temporal Lobe": {
      anatomy: "The Temporal Lobe is located inferior to the lateral sulcus. It houses the primary auditory cortex, Wernicke's area, hippocampus, and amygdala.",
      module: {
        title: "Auditory Processing, Memory, & Emotion Hub",
        sections: [
          {
            heading: "Hippocampus and Memory Consolidation",
            text: "Crucial for forming long-term memories and spatial navigation. Damage to this area stops the brain from creating new memories."
          },
          {
            heading: "Wernicke's Area & Receptive Aphasia",
            text: "Located in the left temporal lobe, it processes language comprehension. Injury causes Wernicke's aphasia, where patients speak fluent but meaningless sentences."
          }
        ],
        articles: [
          { title: "NIH: Neuroanatomy, Temporal Lobe", url: "https://www.ncbi.nlm.nih.gov/books/NBK538321/" }
        ]
      },
      video: "pX3K0rL6W3o" // Shared cerebral mapping video
    },
    "Cerebellum": {
      anatomy: "The Cerebellum ('little brain') is located at the back of the skull. It is highly folded and contains over 50% of all neurons in the brain, arranged in a dense cerebellar cortex.",
      module: {
        title: "Motor Coordination and Balance Control",
        sections: [
          {
            heading: "Fine-Tuning of Movement",
            text: "The cerebellum does not initiate motor commands. Instead, it compares motor commands from the cerebrum with sensory feedback, adjusting timing and force for smooth coordination."
          },
          {
            heading: "Cerebellar Ataxia",
            text: "Damage (due to stroke, trauma, or alcohol) leads to ataxia, characterized by slurred speech, clumsy gait, tremors, and loss of fine motor skills."
          }
        ],
        articles: [
          { title: "PubMed: Anatomy & Physiology of Cerebellum", url: "https://www.ncbi.nlm.nih.gov/books/NBK538169/" },
          { title: "Kenhub: Cerebellar Cortex Pathways", url: "https://www.kenhub.com/en/library/anatomy/the-cerebellum" }
        ]
      },
      video: "7aW9P4-O_fU"
    },
    "Brainstem": {
      anatomy: "The Brainstem consists of the midbrain, pons, and medulla oblongata. It connects the cerebral hemispheres to the spinal cord.",
      module: {
        title: "Autonomic Vital Life Center",
        sections: [
          {
            heading: "Cardiorespiratory Medullary Centers",
            text: "The medulla oblongata contains autonomic nuclei that regulate breathing rate, heart rhythm, vasomotor tone, and reflexes like swallowing and coughing."
          },
          {
            heading: "Cranial Nerve Nuclei & Reticular Activating System (RAS)",
            text: "It houses nuclei for 10 of the 12 cranial nerves and the RAS, which regulates sleep cycles, consciousness, and cortical alertness."
          }
        ],
        articles: [
          { title: "NIH: Brainstem Physiology & Nuclei", url: "https://www.ncbi.nlm.nih.gov/books/NBK541084/" }
        ]
      },
      video: "wM1V6P5_t4g"
    },
    "Cerebral Cortex": {
      anatomy: "The Cerebral Cortex is the highly folded gray matter covering the cerebrum. The folding produces ridges (gyri) and grooves (sulci), maximizing surface area.",
      module: {
        title: "Gray Matter Histology and Cognitive Capacity",
        sections: [
          {
            heading: "Neocortex Layer Architecture",
            text: "The neocortex is divided into six histological layers, featuring pyramidal neurons and stellate cells that handle complex sensory-motor association wiring."
          },
          {
            heading: "Clinical Loss: Dementia and Cortical Atrophy",
            text: "Neurodegenerative conditions (Alzheimer's) cause progressive death of cortical neurons, leading to thinning of gray matter and severe cognitive decline."
          }
        ],
        articles: [
          { title: "NIH: Histology of the Cerebral Cortex", url: "https://www.ncbi.nlm.nih.gov/books/NBK531476/" }
        ]
      },
      video: "mGPz-hBw_Ds"
    }
  }
};

// Region name helper maps mesh/node names to educational terms
function getRegionFromMeshName(meshName, organ) {
  if (!meshName) return null;
  const nameLower = meshName.toLowerCase();
  
  if (organ === "Heart" || organ === "Human Anatomy") {
    if (nameLower.includes("aorta")) return "Aorta";
    if (nameLower.includes("left_ventricle") || nameLower.includes("lv") || (nameLower.includes("ventricle") && nameLower.includes("left"))) return "Left Ventricle";
    if (nameLower.includes("right_ventricle") || nameLower.includes("rv") || (nameLower.includes("ventricle") && nameLower.includes("right"))) return "Right Ventricle";
    if (nameLower.includes("left_atrium") || nameLower.includes("la") || (nameLower.includes("atrium") && nameLower.includes("left"))) return "Left Atrium";
    if (nameLower.includes("right_atrium") || nameLower.includes("ra") || (nameLower.includes("atrium") && nameLower.includes("right"))) return "Right Atrium";
    if (nameLower.includes("pulmonary") || nameLower.includes("artery")) return "Pulmonary Artery";
    return "Myocardium / Heart Wall";
  } else if (organ === "Brain") {
    if (nameLower.includes("cerebellum")) return "Cerebellum";
    if (nameLower.includes("stem") || nameLower.includes("medulla") || nameLower.includes("pons") || nameLower.includes("spinal")) return "Brainstem";
    if (nameLower.includes("frontal")) return "Frontal Lobe";
    if (nameLower.includes("parietal")) return "Parietal Lobe";
    if (nameLower.includes("occipital")) return "Occipital Lobe";
    if (nameLower.includes("temporal")) return "Temporal Lobe";
    if (nameLower.includes("cortex") || nameLower.includes("cerebrum") || nameLower.includes("hemisphere")) return "Cerebral Cortex";
    return "Cerebral Hemisphere Region";
  }
  return meshName.replace(/_/g, " ");
}

// Bounding box center calculator
const getRegionCenter = (scene, regionName, organ) => {
  if (!scene) return null;
  const box = new THREE.Box3();
  let hasMesh = false;
  
  scene.traverse((node) => {
    if (node.isMesh) {
      const nodeRegion = getRegionFromMeshName(node.name, organ);
      if (nodeRegion === regionName) {
        if (!hasMesh) {
          box.setFromObject(node);
          hasMesh = true;
        } else {
          box.expandByObject(node);
        }
      }
    }
  });
  
  if (hasMesh) {
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  }
  return null;
};

// Smooth Camera focus component
function FocusHandler({ targetPoint, controlsRef }) {
  const targetVec = useMemo(() => {
    if (!targetPoint) return null;
    return new THREE.Vector3(targetPoint.x, targetPoint.y, targetPoint.z);
  }, [targetPoint]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (controls) {
      if (targetVec) {
        controls.target.lerp(targetVec, 0.08);
        controls.update();
      } else {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        controls.update();
      }
    }
  });
  return null;
}

function OrganModel({ organ, onSelectPart, selectedRegion, hoveredRegion, onHoverRegion, onLoadScene }) {
  let modelPath = "/src/models/Heart1.glb";

  if (organ === "Brain") {
    modelPath = "/src/models/Brain.glb";
  }

  if (organ === "Human Anatomy") {
    modelPath = "/src/models/HumanAnatomy.glb";
  }

  const { scene } = useGLTF(modelPath);
  const originalMaterials = useRef(new Map());

  // Report scene up to parent when loaded
  useEffect(() => {
    if (scene && onLoadScene) {
      onLoadScene(scene);
    }
  }, [scene, onLoadScene]);

  // Back up original material settings to allow non-destructive glow tinting
  useEffect(() => {
    if (!scene) return;
    originalMaterials.current.clear();
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        originalMaterials.current.set(node.uuid, {
          color: node.material.color ? node.material.color.clone() : null,
          emissive: node.material.emissive ? node.material.emissive.clone() : null,
          emissiveIntensity: node.material.emissiveIntensity !== undefined ? node.material.emissiveIntensity : 0,
        });
      }
    });
  }, [scene]);

  // Handle color & glow updates when selected or hovered parts change
  useEffect(() => {
    if (!scene) return;
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        const orig = originalMaterials.current.get(node.uuid);
        if (!orig) return;

        const nodeRegion = getRegionFromMeshName(node.name, organ);
        const isSelected = selectedRegion && nodeRegion === selectedRegion;
        const isHovered = hoveredRegion && nodeRegion === hoveredRegion;

        if (isSelected) {
          if (node.material.color) node.material.color.setHex(0x22d3ee); // Bright cyan
          if (node.material.emissive) {
            node.material.emissive.setHex(0x06b6d4);
            node.material.emissiveIntensity = 1.0;
          }
        } else if (isHovered) {
          if (node.material.color) node.material.color.setHex(0x0891b2); // Subtler cyan hover
          if (node.material.emissive) {
            node.material.emissive.setHex(0x0e7490);
            node.material.emissiveIntensity = 0.5;
          }
        } else {
          // Reset to initial settings
          if (node.material.color && orig.color) node.material.color.copy(orig.color);
          if (node.material.emissive && orig.emissive) {
            node.material.emissive.copy(orig.emissive);
            node.material.emissiveIntensity = orig.emissiveIntensity;
          }
        }
      }
    });
  }, [scene, selectedRegion, hoveredRegion, organ]);

  return (
    <primitive
      object={scene}
      scale={organ === "Brain" ? 1.8 : 2.2}
      position={[0, -0.5, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const meshName = e.object.name || "";
        const regionName = getRegionFromMeshName(meshName, organ);
        if (regionName) {
          onSelectPart({ label: regionName, point: e.point, meshName });
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        const meshName = e.object.name || "";
        const regionName = getRegionFromMeshName(meshName, organ);
        if (regionName) {
          document.body.style.cursor = "pointer";
          onHoverRegion(regionName);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "default";
        onHoverRegion(null);
      }}
    />
  );
}

function ARViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedOrgan = location.state?.organ || "Heart";
  const [activePanel, setActivePanel] = useState("anatomy");

  // States to simulate interactive features
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Selection states for clicked model component
  const [selectedPart, setSelectedPart] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [loadedScene, setLoadedScene] = useState(null);

  const controlsRef = useRef();

  const buttonStyle = {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(6,182,212,0.15)",
    color: "#06B6D4",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "#06B6D4",
    color: "#0F172A",
    boxShadow: "0 0 15px rgba(6,182,212,0.4)",
  };

  const infoCard = {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "15px",
    color: "#F8FAFC",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
  };

  const getRegionsList = (organ) => {
    if (organ === "Heart" || organ === "Human Anatomy") {
      return [
        "Aorta",
        "Left Ventricle",
        "Right Ventricle",
        "Left Atrium",
        "Right Atrium",
        "Pulmonary Artery",
        "Myocardium / Heart Wall"
      ];
    } else if (organ === "Brain") {
      return [
        "Frontal Lobe",
        "Parietal Lobe",
        "Occipital Lobe",
        "Temporal Lobe",
        "Cerebellum",
        "Brainstem",
        "Cerebral Cortex"
      ];
    }
    return [];
  };

  const regionsList = getRegionsList(selectedOrgan);

  // Get active educational resource based on selected part or general organ
  const activeContent = useMemo(() => {
    const organData = educationalContent[selectedOrgan] || {};
    if (selectedPart && selectedPart.label && organData[selectedPart.label]) {
      return organData[selectedPart.label];
    }
    return organData.general || {
      anatomy: `Explore detailed anatomy of the ${selectedOrgan.toLowerCase()} in interactive 3D and augmented reality. Click on different parts of the 3D model to see local labels and detailed physiological descriptions.`,
      module: {
        title: "Anatomical Learning Guide",
        sections: [{ heading: "Exploring Human Anatomy", text: "Select individual parts of the 3D model to study clinical classifications, blood vascular flow, or neurological innervation configurations." }]
      }
    };
  }, [selectedOrgan, selectedPart]);

  const handleSelectRegionFromSidebar = (regionName) => {
    if (!loadedScene) return;
    const point = getRegionCenter(loadedScene, regionName, selectedOrgan);
    setSelectedPart({
      label: regionName,
      point: point || new THREE.Vector3(0, 0, 0),
      meshName: regionName
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        color: "white",
        fontFamily: "Arial",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Toolbar / Control Bar */}
      <div
        style={{
          height: "60px",
          background: "rgba(15,23,42,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 40px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => navigate("/organ-selection")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back
          </button>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)" }}></div>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#E2E8F0" }}>
            3D Canvas Controls
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            style={autoRotate ? activeButtonStyle : buttonStyle}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            🔄 Rotate
          </button>

          <button 
            style={buttonStyle}
            onClick={() => alert("Zoom using your mouse scroll wheel or pinch trackpad gestures. Drag to rotate model.")}
          >
            🔍 Zoom Info
          </button>

          <button 
            style={showLabels ? activeButtonStyle : buttonStyle}
            onClick={() => setShowLabels(!showLabels)}
          >
            🏷️ Labels Mode
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            width: "350px",
            background: "rgba(30,41,59,0.45)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "25px",
            display: "flex",
            flexDirection: "column",
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
            <div style={{ fontSize: "50px" }}>
              {selectedOrgan === "Heart" && "🫀"}
              {selectedOrgan === "Brain" && "🧠"}
              {selectedOrgan === "Human Anatomy" && "🧍"}
              {selectedOrgan !== "Heart" && selectedOrgan !== "Brain" && selectedOrgan !== "Human Anatomy" && "🩸"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "14px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Current Model</h3>
              <h2 style={{ margin: 0, fontSize: "22px", color: "white", fontWeight: "700" }}>{selectedOrgan}</h2>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", margin: "10px 0" }}>
            <h3 style={{ color: "#06B6D4", fontSize: "20px", fontWeight: "700", margin: "10px 0 5px 0" }}>
              {selectedPart ? selectedPart.label : "Select a Part"}
            </h3>

            <p style={{ color: "#CBD5E1", lineHeight: "1.6", fontSize: "13px", margin: "5px 0" }}>
              {selectedPart ? activeContent.anatomy?.substring(0, 150) + "..." : "Click any anatomical structure directly on the 3D model or choose one from the list below to learn about its function and structure."}
            </p>

            {selectedPart && (
              <button
                onClick={() => setSelectedPart(null)}
                style={{
                  marginTop: "10px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8",
                  fontSize: "12px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  transition: "0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
              >
                🔄 Reset Model View
              </button>
            )}

            {/* Interactive Regions Sidebar Selector */}
            <div style={{ marginTop: "25px" }}>
              <h4 style={{ color: "#94A3B8", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", marginBottom: "12px", fontWeight: "700" }}>
                Interactive Regions
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {regionsList.map((region) => {
                  const isSelected = selectedPart?.label === region;
                  const isHovered = hoveredRegion === region;
                  return (
                    <button
                      key={region}
                      onClick={() => handleSelectRegionFromSidebar(region)}
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: isSelected ? "1px solid #06B6D4" : "1px solid rgba(255,255,255,0.05)",
                        background: isSelected 
                          ? "rgba(6,182,212,0.18)" 
                          : isHovered 
                          ? "rgba(255,255,255,0.06)" 
                          : "rgba(255,255,255,0.02)",
                        color: isSelected ? "#22d3ee" : isHovered ? "white" : "#CBD5E1",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontWeight: isSelected ? "600" : "400",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>{region}</span>
                      <span style={{ fontSize: "11px", opacity: isSelected || isHovered ? 1 : 0.4 }}>➔</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingTop: "15px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{ ...infoCard, cursor: "pointer", padding: "12px 15px", fontSize: "13px", border: activePanel === "anatomy" ? "1px solid #06B6D4" : "1px solid rgba(255,255,255,0.08)", background: activePanel === "anatomy" ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.05)" }}
              onClick={() => setActivePanel("anatomy")}
              onMouseEnter={(e) => {
                if (activePanel !== "anatomy") e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                if (activePanel !== "anatomy") e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = activePanel === "anatomy" ? "#06B6D4" : "rgba(255,255,255,0.08)";
              }}
            >
              🧬 Anatomy & Structure
            </div>

            <div
              style={{ ...infoCard, cursor: "pointer", padding: "12px 15px", fontSize: "13px", border: activePanel === "modules" ? "1px solid #06B6D4" : "1px solid rgba(255,255,255,0.08)", background: activePanel === "modules" ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.05)" }}
              onClick={() => setActivePanel("modules")}
              onMouseEnter={(e) => {
                if (activePanel !== "modules") e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                if (activePanel !== "modules") e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = activePanel === "modules" ? "#06B6D4" : "rgba(255,255,255,0.08)";
              }}
            >
              📚 Learning Modules
            </div>

            <div
              style={{ ...infoCard, cursor: "pointer", padding: "12px 15px", fontSize: "13px", border: activePanel === "videos" ? "1px solid #06B6D4" : "1px solid rgba(255,255,255,0.08)", background: activePanel === "videos" ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.05)" }}
              onClick={() => setActivePanel("videos")}
              onMouseEnter={(e) => {
                if (activePanel !== "videos") e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                if (activePanel !== "videos") e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = activePanel === "videos" ? "#06B6D4" : "rgba(255,255,255,0.08)";
              }}
            >
              🎥 Video Guides
            </div>
          </div>
        </div>

        {/* Viewer 3D Canvas */}
        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              background: "rgba(6,182,212,0.12)",
              borderRadius: "50%",
              filter: "blur(150px)",
              top: "20%",
              left: "30%",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          <Canvas
            camera={{
              position: [0, 0, 5],
            }}
            style={{ zIndex: 1 }}
          >
            <ambientLight intensity={3.5} />

            <directionalLight
              position={[2, 2, 2]}
              intensity={3.5}
            />

            <OrganModel 
              organ={selectedOrgan} 
              onSelectPart={(part) => setSelectedPart(part)}
              selectedRegion={selectedPart?.label}
              hoveredRegion={hoveredRegion}
              onHoverRegion={setHoveredRegion}
              onLoadScene={setLoadedScene}
            />

            {/* Camera transition focus */}
            <FocusHandler targetPoint={selectedPart?.point} controlsRef={controlsRef} />

            {/* Glowing pinpoint and premium floating text label */}
            {showLabels && selectedPart && selectedPart.point && (
              <mesh position={[selectedPart.point.x, selectedPart.point.y, selectedPart.point.z]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#06B6D4" toneMapped={false} />
                <Html distanceFactor={6} center>
                  <div style={{
                    position: "relative",
                    transform: "translateY(-45px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}>
                    <div style={{
                      background: "rgba(15, 23, 42, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "2px solid #06B6D4",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "700",
                      fontFamily: "sans-serif",
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 20px rgba(6,182,212,0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                      <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#06B6D4",
                        boxShadow: "0 0 8px #06B6D4",
                        display: "inline-block"
                      }}></span>
                      {selectedPart.label}
                    </div>
                    {/* Connecting vertical line */}
                    <div style={{
                      width: "2px",
                      height: "25px",
                      background: "linear-gradient(to bottom, #06B6D4, rgba(6,182,212,0.1))",
                      boxShadow: "0 0 4px #06B6D4",
                    }}></div>
                  </div>
                </Html>
              </mesh>
            )}

            <OrbitControls ref={controlsRef} autoRotate={autoRotate} />
          </Canvas>
        </div>
      </div>

      {/* Side Detail Panel overlay */}
      {activePanel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "420px",
            height: "100vh",
            background: "#0F172A",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            padding: "30px",
            zIndex: 9999,
            overflowY: "auto",
            fontFamily: "sans-serif",
          }}
        >
          <button
            onClick={() => setActivePanel(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              float: "right",
            }}
          >
            ✕
          </button>

          {activePanel === "anatomy" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "15px", fontSize: "24px", fontWeight: "700" }}>
                🧬 Anatomy & Structure
              </h2>
              <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "15px" }}>
                {selectedPart ? selectedPart.label : selectedOrgan}
              </h3>
              <p style={{ lineHeight: "1.8", color: "#CBD5E1", fontSize: "14px" }}>
                {activeContent.anatomy}
              </p>
              
              <div style={{ marginTop: "30px", padding: "18px", background: "rgba(6, 182, 212, 0.05)", borderRadius: "12px", border: "1px solid rgba(6, 182, 212, 0.15)" }}>
                <h4 style={{ color: "#06B6D4", margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>Quick Tip</h4>
                <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                  You can click around the 3D model to explore and compare neighboring structures. Rotate using drag and zoom using the mouse wheel.
                </p>
              </div>
            </>
          )}

          {activePanel === "modules" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "15px", fontSize: "24px", fontWeight: "700" }}>
                📚 Learning Modules
              </h2>
              <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "15px" }}>
                {activeContent.module?.title || "Educational Guide"}
              </h3>
              
              {activeContent.module?.sections?.map((sec, idx) => (
                <div key={idx} style={{ marginBottom: "20px" }}>
                  <h4 style={{ color: "#22d3ee", fontSize: "14px", fontWeight: "600", margin: "0 0 6px 0" }}>
                    {idx + 1}. {sec.heading}
                  </h4>
                  <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                    {sec.text}
                  </p>
                </div>
              ))}

              {activeContent.module?.articles && activeContent.module.articles.length > 0 && (
                <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                  <h4 style={{ color: "#E2E8F0", fontSize: "14px", marginBottom: "12px", fontWeight: "600" }}>
                    Recommended Scientific Reading:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {activeContent.module.articles.map((art, idx) => (
                      <a
                        key={idx}
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          color: "#06B6D4",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: "500",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#22d3ee"}
                        onMouseLeave={(e) => e.target.style.color = "#06B6D4"}
                      >
                        📖 {art.title} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activePanel === "videos" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "15px", fontSize: "24px", fontWeight: "700" }}>
                🎥 Video Guides
              </h2>
              <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "15px" }}>
                Visual Lecture: {selectedPart ? selectedPart.label : selectedOrgan}
              </h3>
              
              {activeContent.video ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid rgba(6, 182, 212, 0.3)",
                    boxShadow: "0 0 20px rgba(6, 182, 212, 0.2)",
                    background: "black"
                  }}>
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${activeContent.video}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p style={{ color: "#94A3B8", fontSize: "12px", lineHeight: "1.5" }}>
                    Watch this curated video to see clinical demonstrations, anatomical diagrams, and visual lectures explaining the function and dynamics of the {selectedPart ? selectedPart.label.toLowerCase() : selectedOrgan.toLowerCase()}.
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${activeContent.video}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      alignSelf: "flex-start",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: "rgba(6, 182, 212, 0.15)",
                      border: "1px solid #06B6D4",
                      color: "#06B6D4",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#06B6D4";
                      e.target.style.color = "#0F172A";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(6, 182, 212, 0.15)";
                      e.target.style.color = "#06B6D4";
                    }}
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              ) : (
                <p style={{ color: "#94A3B8", fontSize: "13px" }}>No video guide available for this section.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ARViewer;