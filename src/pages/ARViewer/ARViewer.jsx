import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ComparisonViewer from "../Comparison/ComparisonViewer";
import { FaYoutube } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { generateQuiz } from "../../services/quizApi";
import { videoData } from "../../data/videoData";
import "./ARViewer.css";

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
  ,

  Lungs: {
    general: {
      anatomy: "The lungs are paired, spongy, cone-shaped organs located in the thoracic cavity. The right lung is larger and divided into three lobes, while the left lung has two lobes and a cardiac notch to accommodate the heart. They are surrounded by the pleural membrane and are responsible for pulmonary ventilation and gas exchange.",
      module: {
        title: "Respiratory Mechanics & Gas Exchange",
        sections: [
          {
            heading: "The Alveolar-Capillary Membrane",
            text: "Gas exchange occurs across this extremely thin membrane (less than 1 micrometer thick) located in millions of alveoli. Oxygen diffuses down its concentration gradient into the blood, while carbon dioxide diffuses into the alveolar space."
          },
          {
            heading: "Pulmonary Surfactant",
            text: "Type II alveolar cells secrete surfactant, a complex mixture of lipids and proteins. This fluid reduces surface tension, preventing alveolar collapse during exhalation and significantly decreasing the work of breathing."
          },
          {
            heading: "Clinical Correlation: Pneumonia",
            text: "An acute inflammation of the alveoli, usually caused by infection. The alveolar sacs fill with fluid and cellular debris, severely impairing oxygen diffusion and leading to hypoxemia."
          }
        ]
      },
      video: "mOKmjYwfDFA"
    }
  },
  Kidney: {
    general: {
      anatomy: "The kidneys are paired, retroperitoneal, bean-shaped organs that receive about 20% of the cardiac output. Each kidney contains approximately one million functional units called nephrons, which filter blood plasma, reabsorb essential nutrients, and secrete waste products to form urine.",
      module: {
        title: "Renal Physiology & Hemodynamics",
        sections: [
          {
            heading: "Glomerular Filtration Rate (GFR)",
            text: "Blood enters the glomerulus under high hydrostatic pressure, forcing water and solutes through the filtration membrane into Bowman's capsule. Normal GFR is about 125 mL/min, reflecting overall renal health."
          },
          {
            heading: "Tubular Reabsorption",
            text: "As the filtrate passes through the proximal convoluted tubule, loop of Henle, and distal tubule, over 99% of filtered water, glucose, and essential electrolytes are actively reabsorbed back into the peritubular capillaries."
          },
          {
            heading: "Endocrine Functions",
            text: "Beyond filtration, kidneys produce erythropoietin (stimulating red blood cell production), release renin (regulating blood pressure via the RAAS system), and synthesize active Vitamin D."
          }
        ]
      },
      video: "cc8sUsg9ccg"
    }
  },
  Stomach: {
    general: {
      anatomy: "The stomach is a J-shaped muscular pouch located in the upper left quadrant of the abdomen. It acts as a mixing chamber and temporary reservoir, mechanically churning food and chemically breaking it down using highly acidic gastric juices to form chyme.",
      module: {
        title: "Gastric Digestion & Mucosal Integrity",
        sections: [
          {
            heading: "Parietal Cells & Hydrochloric Acid",
            text: "Parietal cells in the gastric glands secrete HCl, creating a highly acidic environment (pH 1.5 - 3.5). This acidity denatures dietary proteins, kills ingested pathogens, and converts inactive pepsinogen into the active enzyme pepsin."
          },
          {
            heading: "The Mucosal Bicarbonate Barrier",
            text: "To prevent the stomach from digesting itself, surface mucous cells secrete a thick, alkaline mucus layer containing bicarbonate ions. This protective barrier neutralizes acid at the mucosal surface."
          },
          {
            heading: "Peptic Ulcer Disease",
            text: "If the mucosal barrier is compromised—often due to Helicobacter pylori infection or chronic NSAID use—gastric acid erodes the underlying tissue, causing painful and potentially bleeding ulcers."
          }
        ]
      },
      video: "Q-n_Q0NCGjc"
    }
  },
  Intestines: {
    general: {
      anatomy: "The intestines comprise the highly coiled small intestine (duodenum, jejunum, ileum) and the wider, segmented large intestine (colon). They are the primary sites for enzymatic digestion, massive nutrient absorption, and final water conservation.",
      module: {
        title: "Enteric Absorption & Microbiome",
        sections: [
          {
            heading: "Villi and Microvilli (Brush Border)",
            text: "The inner lining of the small intestine features finger-like projections (villi), which themselves possess microscopic extensions (microvilli). This structural design exponentially increases the surface area for maximum nutrient absorption."
          },
          {
            heading: "The Gut Microbiome",
            text: "The large intestine houses trillions of symbiotic bacteria that ferment indigestible carbohydrates, synthesize essential vitamins (like Vitamin K and Biotin), and play a critical role in immune system modulation."
          },
          {
            heading: "Celiac Disease",
            text: "An autoimmune condition triggered by gluten ingestion, leading to severe inflammation and blunting of the intestinal villi, resulting in profound malabsorption and systemic malnutrition."
          }
        ]
      },
      video: "p1Fvw3P_XKw"
    }
  },
  Skull: {
    general: {
      anatomy: "The human skull is a complex bony structure consisting of 22 fused bones (excluding the ossicles). It is divided into the neurocranium, which forms a protective vault around the brain, and the viscerocranium, which provides the structural framework for the face and jaw.",
      module: {
        title: "Cranial Osteology & Sutures",
        sections: [
          {
            heading: "Cranial Sutures and Fontanelles",
            text: "In adults, cranial bones are rigidly fused by fibrous joints called sutures (coronal, sagittal, lambdoid). In infants, these areas contain flexible connective tissue (fontanelles) allowing the skull to compress during birth and expand as the brain grows."
          },
          {
            heading: "Foramen Magnum & Cranial Nerves",
            text: "The base of the skull features numerous openings (foramina). The largest, the foramen magnum, allows the spinal cord to connect to the brainstem. Smaller foramina serve as exit pathways for the 12 pairs of cranial nerves."
          },
          {
            heading: "Sinus Cavities",
            text: "The skull contains paranasal sinuses—air-filled spaces lined with mucous membranes. They lighten the skull's overall weight, act as resonance chambers for the voice, and help warm and humidify inhaled air."
          }
        ]
      },
      video: "Vf_E7j1y8k4"
    }
  },
  Skeleton: {
    general: {
      anatomy: "The adult human skeleton consists of 206 bones, forming the internal structural framework of the body. It is divided into the axial skeleton (skull, vertebral column, rib cage) providing core protection, and the appendicular skeleton (limbs, girdles) facilitating highly articulated movement.",
      module: {
        title: "Osteology & Bone Remodeling",
        sections: [
          {
            heading: "Cortical vs. Cancellous Bone",
            text: "Bone tissue exists in two forms: Cortical (compact) bone provides a dense, solid outer shell for structural strength, while Cancellous (spongy) bone contains a porous trabecular network housing bone marrow and reducing overall weight."
          },
          {
            heading: "Dynamic Bone Remodeling",
            text: "The skeleton is not a static structure; it undergoes constant remodeling. Osteoclasts continuously break down old bone tissue to release calcium into the blood, while osteoblasts synthesize new bone matrix to maintain structural integrity."
          },
          {
            heading: "Osteoporosis",
            text: "A metabolic bone disease where osteoclastic resorption outpaces osteoblastic formation. This leads to a severe loss of bone density, thinning of trabeculae, and a highly increased risk of pathological fractures."
          }
        ]
      },
      video: "rDGqkMHPDq0"
    }
  },
  "Human Anatomy": {
    general: {
      anatomy: "Human anatomy is the comprehensive scientific study of the morphology of the human body. It explores the intricate spatial and functional relationships between macroscopic organ systems, exploring how they collectively establish and maintain physiological homeostasis.",
      module: {
        title: "Systemic Integration & Homeostasis",
        sections: [
          {
            heading: "Cardiopulmonary Coupling",
            text: "The cardiovascular and respiratory systems are anatomically and functionally coupled. The heart's right ventricle pumps deoxygenated blood strictly to the pulmonary circulation, perfectly matching perfusion to alveolar ventilation."
          },
          {
            heading: "Neuroendocrine Control Axis",
            text: "The nervous system provides rapid electrochemical signaling, while the endocrine system releases hormones for sustained metabolic regulation. Together via the hypothalamus-pituitary axis, they control virtually all physiological responses."
          },
          {
            heading: "Musculoskeletal Biomechanics",
            text: "Skeletal muscles span synovial joints and anchor to bones via tendons. Driven by motor neurons, muscular contraction exerts mechanical force across the skeletal levers, resulting in complex, coordinated physical movement."
          }
        ]
      },
      video: "uBGl2B17KXc"
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

function OrganModel({ organ, onSelectPart, selectedRegion, hoveredRegion, onHoverRegion, onLoadScene, isBeating }) {
  const groupRef = useRef();
  const targetScale = useRef(0);
  let modelPath = "/models/human_heart.glb"; // Default to Heart

  if (organ === "Brain") modelPath = "/models/human_brain_cerebrum__brainstem.glb";
  else if (organ === "Human Anatomy") modelPath = "/models/male_full_body_ecorche.glb";
  else if (organ === "Lungs") modelPath = "/models/respiratory_system.glb";
  else if (organ === "Kidney") modelPath = "/models/kidney.glb";
  else if (organ === "Stomach") modelPath = "/models/realistic_human_stomach.glb";
  else if (organ === "Intestines") modelPath = "/models/small_and_large_intestine.glb";
  else if (organ === "Skull") modelPath = "/models/human_male_skull.glb";
  else if (organ === "Skeleton") modelPath = "/models/ecorche_-_anatomy_study.glb";

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

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Reset group transforms to measure raw scene
    groupRef.current.scale.set(1, 1, 1);
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.updateMatrixWorld(true);

    // Compute bounding box strictly for visible meshes to ignore invisible lights/armatures
    const box = new THREE.Box3();
    box.makeEmpty();

    scene.traverse((node) => {
      if (node.isMesh && node.visible && !node.name.toLowerCase().includes('light') && !node.name.toLowerCase().includes('camera')) {
        node.geometry.computeBoundingBox();
        const meshBox = node.geometry.boundingBox.clone();
        meshBox.applyMatrix4(node.matrixWorld);
        box.union(meshBox);
      }
    });

    if (box.isEmpty()) {
      box.setFromObject(scene); // fallback if no meshes found
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Anatomical models often have long protruding vessels (ureters, veins) 
    // that heavily skew the geometric center away from the visual center of mass.
    const organConfig = {
      Kidney: { scaleMultiplier: 0.85, xOffset: -0.1, yOffset: 0.5, zOffset: 0 },
      Lungs: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Stomach: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Intestines: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Skeleton: { scaleMultiplier: 1.0, xOffset: 0, yOffset: -0.4, zOffset: 0 },
      "Human Anatomy": { scaleMultiplier: 1.0, xOffset: 0, yOffset: -0.4, zOffset: 0 },
    };

    if (maxDim > 0) {
      // Auto-scale all models to fit uniformly
      let targetSize = 4.0;
      if (organ === "Human Anatomy" || organ === "Skeleton") targetSize = 5.5;

      const conf = organConfig[organ] || { scaleMultiplier: 1.0, xOffset: 0, yOffset: 0, zOffset: 0 };
      const scale = (targetSize / maxDim) * conf.scaleMultiplier;
      targetScale.current = scale;
      groupRef.current.scale.set(scale, scale, scale);

      // Auto-center based on bounds, then apply manual corrections for visual center of mass
      groupRef.current.position.set(
        (-center.x * scale) + conf.xOffset,
        (-center.y * scale) + conf.yOffset,
        (-center.z * scale) + conf.zOffset
      );
    }
  }, [scene, organ]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (organ === "Heart" && isBeating) {
      const elapsed = state.clock.getElapsedTime();
      let offset = 0;
      
      // Normal sinus beat (lub-dub)
      const t = (elapsed * 1.4) % 2.0;
      if (t < 0.25) {
        offset = Math.sin((t / 0.25) * Math.PI) * 0.06; // Lub
      } else if (t >= 0.3 && t < 0.55) {
        offset = Math.sin(((t - 0.3) / 0.25) * Math.PI) * 0.09; // Dub
      }
      
      const finalScale = targetScale.current * (1 + offset);
      groupRef.current.scale.set(finalScale, finalScale, finalScale);
    } else {
      // Ensure scale is exactly targetScale for other organs
      if (targetScale.current > 0) {
        groupRef.current.scale.set(targetScale.current, targetScale.current, targetScale.current);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
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
    </group>
  );
}

function ARViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedOrgan = location.state?.organ || "Heart";
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "anatomy" | "quiz" | "comparison" | "videos"
  const [activePanel, setActivePanel] = useState("overview");
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBeating, setIsBeating] = useState(true);

  useEffect(() => {
    setPlayingVideoId(null);
  }, [activeTab]);

  // States to simulate interactive features
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Selection states for clicked model component
  const [selectedPart, setSelectedPart] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [loadedScene, setLoadedScene] = useState(null);

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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

  // Fallback local quizzes for all 7 organs
  const fallbackQuizzes = {
    Heart: [
      {
        question: "Which of the following chambers pumps oxygenated blood to the body tissues via the aorta?",
        options: ["Right Ventricle", "Left Ventricle", "Right Atrium", "Left Atrium"],
        correctAnswer: "Left Ventricle"
      },
      {
        question: "Where is the natural pacemaker (Sinoatrial Node) of the heart located?",
        options: ["Right Ventricle", "Left Ventricle", "Right Atrium", "Left Atrium"],
        correctAnswer: "Right Atrium"
      },
      {
        question: "What is the normal ejection fraction percentage for a healthy adult heart?",
        options: ["20% - 30%", "35% - 45%", "55% - 70%", "85% - 100%"],
        correctAnswer: "55% - 70%"
      }
    ],
    Brain: [
      {
        question: "Which lobe of the cerebral cortex is primarily responsible for executive decision-making and personality?",
        options: ["Temporal Lobe", "Occipital Lobe", "Frontal Lobe", "Parietal Lobe"],
        correctAnswer: "Frontal Lobe"
      },
      {
        question: "The primary visual processing cortex (V1) is located in which lobe?",
        options: ["Frontal Lobe", "Parietal Lobe", "Temporal Lobe", "Occipital Lobe"],
        correctAnswer: "Occipital Lobe"
      },
      {
        question: "Which structure coordinates fine motor control, balance, and posture?",
        options: ["Brainstem", "Cerebellum", "Frontal Lobe", "Cerebral Cortex"],
        correctAnswer: "Cerebellum"
      }
    ],
    Lungs: [
      {
        question: "What is the primary anatomical site where oxygen and carbon dioxide gas exchange occurs?",
        options: ["Trachea", "Alveoli", "Bronchioles", "Pleural Cavity"],
        correctAnswer: "Alveoli"
      },
      {
        question: "Which lung volume parameter represents the maximum volume of air that can be exhaled after a maximum inhalation?",
        options: ["Tidal Volume", "Residual Volume", "Vital Capacity", "Total Lung Capacity"],
        correctAnswer: "Vital Capacity"
      }
    ],
    Liver: [
      {
        question: "What is the primary cell type that makes up 80% of the liver's mass and performs metabolic functions?",
        options: ["Kupffer cells", "Hepatocytes", "Stellate cells", "Endothelial cells"],
        correctAnswer: "Hepatocytes"
      },
      {
        question: "Which condition is characterized by irreversible scarring and nodular regeneration of liver tissue?",
        options: ["Steatosis", "Hepatitis", "Cirrhosis", "Gallstones"],
        correctAnswer: "Cirrhosis"
      }
    ],
    Kidney: [
      {
        question: "What is the basic functional and structural unit of the kidney responsible for filtering blood?",
        options: ["Nephron", "Glomerulus", "Renal Tubule", "Calyx"],
        correctAnswer: "Nephron"
      },
      {
        question: "A normal Glomerular Filtration Rate (GFR) for healthy adult kidneys lies in which range?",
        options: ["10-15 ml/min", "30-45 ml/min", "55-70 ml/min", "90-120 ml/min"],
        correctAnswer: "90-120 ml/min"
      }
    ],
    Eye: [
      {
        question: "Which structure of the eye is primarily affected by protein clumping and opacification in cataracts?",
        options: ["Cornea", "Retina", "Crystalline Lens", "Iris"],
        correctAnswer: "Crystalline Lens"
      },
      {
        question: "Which layer of the eye contains photoreceptors (rods and cones) that process light signals?",
        options: ["Sclera", "Choroid", "Cornea", "Retina"],
        correctAnswer: "Retina"
      }
    ],
    Skeleton: [
      {
        question: "Which condition is characterized by a severe loss of bone mineral density and porous trabecular networks?",
        options: ["Arthritis", "Osteoporosis", "Scoliosis", "Rickets"],
        correctAnswer: "Osteoporosis"
      },
      {
        question: "Which anatomical feature of the pelvis is wider and shallower in females as an adaptation for childbirth?",
        options: ["Pelvic Inlet", "Subpubic Angle", "Iliac Crest", "Acetabulum"],
        correctAnswer: "Pelvic Inlet"
      }
    ]
  };

  // Load Quiz questions
  useEffect(() => {
    if (activeTab === "quiz" && quizQuestions.length === 0) {
      setQuizLoading(true);
      generateQuiz(selectedOrgan, "Medium")
        .then((questions) => {
          if (questions && questions.length > 0) {
            setQuizQuestions(questions);
          } else {
            setQuizQuestions(fallbackQuizzes[selectedOrgan] || fallbackQuizzes.Heart);
          }
        })
        .catch((err) => {
          console.error("Error generating quiz:", err);
          setQuizQuestions(fallbackQuizzes[selectedOrgan] || fallbackQuizzes.Heart);
        })
        .finally(() => {
          setQuizLoading(false);
        });
    }
  }, [activeTab, selectedOrgan, quizQuestions.length]);

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

  // Get list of videos for the selected organ/part
  const getVideosForOrgan = (organ, part) => {
    const key = organ === "Human Anatomy" ? "Heart" : organ;
    if (videoData[key]) {
      return videoData[key];
    }

    const defaultVideoId = activeContent.video;
    if (defaultVideoId) {
      return [
        {
          id: defaultVideoId,
          title: `Visual Lecture: ${part ? part.label : organ}`,
          duration: "N/A",
          thumbnail: `https://img.youtube.com/vi/${defaultVideoId}/hqdefault.jpg`,
          youtubeUrl: `https://www.youtube.com/watch?v=${defaultVideoId}`,
          desc: `Watch this curated video explaining the structure and function of the ${part ? part.label.toLowerCase() : organ.toLowerCase()}.`
        }
      ];
    }
    return [];
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: "hidden",
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {!isFullscreen && <Navbar />}

      {/* Viewer Module Tabs */}
      {activeTab === "comparison" ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 35px" }}>
          <ComparisonViewer organName={selectedOrgan} hideHeader={true} />
        </div>
      ) : (
        <>
          {/* Main Content Area */}
          <div className="ar-main-layout" style={{ flex: 1, minHeight: 0, position: "relative" }}>

            {/* Viewer 3D Canvas */}
            <div className="ar-canvas-container">
              {/* Floating Header Card */}
              {!isFullscreen && (
                <div className="floating-header-card">
                  <button
                    onClick={() => navigate("/organ-selection")}
                    style={{
                      background: "transparent",
                      border: "none",

                      color: "#94A3B8",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: 0,
                      marginBottom: "15px",
                      width: "fit-content",
                      fontWeight: "600",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#F8FAFC"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
                  >
                    ← Back to Selection
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "45px", height: "45px", flexShrink: 0 }}>
                      {selectedOrgan === "Heart" && <span style={{ fontSize: "40px" }}>🫀</span>}
                      {selectedOrgan === "Brain" && <span style={{ fontSize: "40px" }}>🧠</span>}
                      {selectedOrgan === "Lungs" && <span style={{ fontSize: "40px" }}>🫁</span>}
                      {selectedOrgan === "Liver" && <img src="/icons/liver.png" alt="Liver" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      {selectedOrgan === "Kidney" && <img src="/icons/kidney.png" alt="Kidney" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      {selectedOrgan === "Stomach" && <img src="/icons/stomach.png" alt="Stomach" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      {selectedOrgan === "Intestines" && <img src="/icons/intestines.png" alt="Intestines" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      {selectedOrgan === "Human Anatomy" && <img src="/icons/human.png" alt="Human Anatomy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      {selectedOrgan === "Skeleton" && <span style={{ fontSize: "40px" }}>🦴</span>}
                      {selectedOrgan === "Skull" && <span style={{ fontSize: "40px" }}>💀</span>}
                      {selectedOrgan === "Eye" && <span style={{ fontSize: "40px" }}>👁️</span>}
                      {["Heart", "Brain", "Lungs", "Liver", "Kidney", "Stomach", "Intestines", "Human Anatomy", "Skeleton", "Skull", "Eye"].indexOf(selectedOrgan) === -1 && <span style={{ fontSize: "40px" }}>🧪</span>}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "12px", color: "#06B6D4", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "800" }}>Current Model</h3>
                      <h2 style={{ margin: 0, fontSize: "22px", color: "white", fontWeight: "800", letterSpacing: "0.5px" }}>{selectedOrgan}</h2>
                    </div>
                  </div>
                </div>
              )}
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
                  onLoadScene={setLoadedScene}
                  isBeating={isBeating}
                />

                <OrbitControls ref={controlsRef} autoRotate={autoRotate} />
              </Canvas>
            </div>

            {/* Side Detail Panel (Inline Sibling) */}
            {!isFullscreen && activePanel && (
              <div className="ar-right-panel" style={{ bottom: "24px", height: "calc(100% - 48px)", borderRadius: "28px", borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <button
                  onClick={() => setActivePanel(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    outline: "none",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    borderRadius: "50%",
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#F8FAFC";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748B";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <FiX size={20} />
                </button>

                {activePanel === "overview" && (
                  <>
                    <h2 style={{
                      background: "linear-gradient(90deg, #22D3EE, #818CF8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "16px",
                      fontSize: "26px",
                      fontWeight: "800",
                      letterSpacing: "0.5px",
                      marginTop: "10px"
                    }}>
                      Overview: {selectedOrgan}
                    </h2>
                    <p style={{ lineHeight: "1.8", color: "#94A3B8", fontSize: "14px", margin: "0 0 16px 0" }}>
                      {educationalContent[selectedOrgan]?.general?.anatomy || `Detailed overview and diagnostic models for ${selectedOrgan.toLowerCase()} functions.`}
                    </p>

                    <div style={{
                      height: "1px",
                      background: "linear-gradient(90deg, rgba(34,211,238,0.5) 0%, transparent 100%)",
                      marginBottom: "20px"
                    }} />

                    <div>
                      <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "16px", fontWeight: "700" }}>
                        {educationalContent[selectedOrgan]?.general?.module?.title || "Educational Guide"}
                      </h3>
                      {educationalContent[selectedOrgan]?.general?.module?.sections?.map((sec, idx) => (
                        <div key={idx} style={{ marginBottom: "24px" }}>
                          <h4 style={{ color: "#22d3ee", fontSize: "15px", fontWeight: "600", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "6px", background: "rgba(34, 211, 238, 0.15)", color: "#22D3EE", fontSize: "12px" }}>{idx + 1}</span>
                            {sec.heading}
                          </h4>
                          <p style={{ color: "#94A3B8", fontSize: "13.5px", lineHeight: "1.7", margin: 0, paddingLeft: "34px" }}>
                            {sec.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activePanel === "anatomy" && (
                  <>
                    <h2 style={{
                      background: "linear-gradient(90deg, #22D3EE, #818CF8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "16px",
                      fontSize: "26px",
                      fontWeight: "800",
                      letterSpacing: "0.5px",
                      marginTop: "10px"
                    }}>
                      Anatomy & Structure
                    </h2>
                    <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "15px", fontWeight: "700" }}>
                      {selectedPart ? selectedPart.label : selectedOrgan}
                    </h3>
                    <p style={{ lineHeight: "1.8", color: "#94A3B8", fontSize: "14px", marginTop: 0 }}>
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

                {activePanel === "quiz" && (
                  <div>
                    <h2 style={{
                      background: "linear-gradient(90deg, #22D3EE, #818CF8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "16px",
                      fontSize: "26px",
                      fontWeight: "800",
                      letterSpacing: "0.5px",
                      marginTop: "10px"
                    }}>
                      Organ Assessment
                    </h2>

                    {quizLoading ? (
                      <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <div className="spinner" style={{ margin: "0 auto 15px auto" }}></div>
                        <p style={{ color: "#06B6D4", fontWeight: "600" }}>Generating Adaptive Quiz...</p>
                      </div>
                    ) : quizFinished ? (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <h3 style={{ color: "#34D399", fontSize: "22px", marginBottom: "10px" }}>🎉 Quiz Completed!</h3>
                        <p style={{ fontSize: "16px", color: "#CBD5E1", margin: "10px 0" }}>
                          You scored <strong style={{ color: "#00f2fe", fontSize: "24px" }}>{quizScore}</strong> out of <strong>{quizQuestions.length}</strong>
                        </p>

                        <div style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "14px",
                          padding: "16px",
                          margin: "20px 0",
                          fontSize: "13px",
                          color: "#CBD5E1",
                          lineHeight: "1.6"
                        }}>
                          {quizScore === quizQuestions.length ? "🌟 Perfect! You have demonstrated exceptional knowledge about this organ's physiology." : quizScore >= quizQuestions.length / 2 ? "👍 Good job! You understand the foundational mechanics of this organ." : "📚 Try reviewing the Anatomy structures and take the quiz again to master this organ."}
                        </div>

                        <button
                          onClick={() => {
                            setCurrentQuestionIndex(0);
                            setSelectedAnswer(null);
                            setQuizScore(0);
                            setQuizFinished(false);
                          }}
                          style={activeButtonStyle}
                        >
                          Restart Assessment
                        </button>
                      </div>
                    ) : quizQuestions.length > 0 ? (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: "12px", marginBottom: "15px" }}>
                          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                          <span style={{ fontWeight: "700" }}>Score: {quizScore}</span>
                        </div>

                        <p style={{ color: "white", fontWeight: "700", fontSize: "15px", lineHeight: "1.5", marginBottom: "20px" }}>
                          {quizQuestions[currentQuestionIndex]?.question}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {quizQuestions[currentQuestionIndex]?.options.map((opt) => {
                            const isSelected = selectedAnswer === opt;
                            const isCorrect = opt === quizQuestions[currentQuestionIndex].correctAnswer;
                            let optBg = "rgba(255, 255, 255, 0.02)";
                            let optBorder = "1px solid rgba(255, 255, 255, 0.05)";
                            let optColor = "#CBD5E1";

                            if (selectedAnswer !== null) {
                              if (isCorrect) {
                                optBg = "rgba(16, 185, 129, 0.12)";
                                optBorder = "1px solid #10B981";
                                optColor = "#34D399";
                              } else if (isSelected) {
                                optBg = "rgba(239, 68, 68, 0.12)";
                                optBorder = "1px solid #EF4444";
                                optColor = "#F87171";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={selectedAnswer !== null}
                                onClick={() => {
                                  setSelectedAnswer(opt);
                                  if (opt === quizQuestions[currentQuestionIndex].correctAnswer) {
                                    setQuizScore(prev => prev + 1);
                                  }
                                }}
                                style={{
                                  textAlign: "left",
                                  padding: "14px 16px",
                                  borderRadius: "10px",
                                  background: optBg,
                                  border: optBorder,
                                  color: optColor,
                                  cursor: selectedAnswer === null ? "pointer" : "default",
                                  transition: "all 0.2s ease",
                                  fontSize: "13px",
                                  fontWeight: isSelected ? "700" : "500",
                                  display: "block",
                                  width: "100%"
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {selectedAnswer !== null && (
                          <button
                            onClick={() => {
                              if (currentQuestionIndex + 1 < quizQuestions.length) {
                                setCurrentQuestionIndex(prev => prev + 1);
                                setSelectedAnswer(null);
                              } else {
                                setQuizFinished(true);
                              }
                            }}
                            style={{
                              ...activeButtonStyle,
                              marginTop: "20px",
                              width: "100%",
                              padding: "12px"
                            }}
                          >
                            {currentQuestionIndex + 1 < quizQuestions.length ? "Next Question →" : "Finish Assessment"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "#94A3B8" }}>Failed to generate questions. Try again later.</p>
                    )}
                  </div>
                )}

                {activePanel === "videos" && (
                  <>
                    <h2 style={{ color: "#06B6D4", marginBottom: "15px", fontSize: "24px", fontWeight: "700" }}>
                      🎥 Video Guides
                    </h2>
                    <h3 style={{ color: "#E2E8F0", fontSize: "18px", marginBottom: "15px" }}>
                      Visual Lectures: {selectedPart ? selectedPart.label : selectedOrgan}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                      {getVideosForOrgan(selectedOrgan, selectedPart).map((vid) => (
                        <div key={vid.id} style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "16px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#FFF", flex: 1, paddingRight: "10px" }}>{vid.title}</div>
                            <span style={{
                              background: "rgba(6, 182, 212, 0.1)",
                              border: "1px solid rgba(6, 182, 212, 0.25)",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#22D3EE",
                              whiteSpace: "nowrap"
                            }}>
                              ⏱️ {vid.duration}
                            </span>
                          </div>

                          {playingVideoId === vid.id ? (
                            <div style={{
                              width: "100%",
                              borderRadius: "12px",
                              overflow: "hidden",
                              border: "2px solid rgba(6, 182, 212, 0.3)",
                              boxShadow: "0 0 20px rgba(6, 182, 212, 0.2)",
                              background: "black",
                              height: "180px"
                            }}>
                              <iframe
                                width="100%"
                                height="180"
                                src={`https://www.youtube.com/embed/${vid.id}?autoplay=1`}
                                title={vid.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                style={{ display: "block" }}
                              ></iframe>
                            </div>
                          ) : (
                            <div
                              onClick={() => setPlayingVideoId(vid.id)}
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "180px",
                                borderRadius: "12px",
                                overflow: "hidden",
                                cursor: "pointer",
                                border: "2px solid rgba(255, 255, 255, 0.08)",
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                                background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${vid.thumbnail}) no-repeat center center`,
                                backgroundSize: "cover"
                              }}
                            >
                              <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0, 0, 0, 0.25)",
                                transition: "all 0.3s ease"
                              }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.25)"}
                              >
                                <div style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  background: "rgba(6, 182, 212, 0.9)",
                                  boxShadow: "0 0 15px rgba(6, 182, 212, 0.6)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "18px",
                                  color: "#0F172A",
                                  paddingLeft: "3px",
                                  transition: "all 0.2s ease"
                                }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                  ▶
                                </div>
                              </div>
                            </div>
                          )}

                          <p style={{ color: "#94A3B8", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
                            {vid.desc}
                          </p>

                          <a
                            href={vid.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "10px",
                              borderRadius: "8px",
                              backgroundColor: "#FF0000",
                              color: "#FFFFFF",
                              textDecoration: "none",
                              fontWeight: "700",
                              fontSize: "13px",
                              transition: "all 0.3s ease",
                              border: "none",
                              boxShadow: "0 4px 15px rgba(255, 0, 0, 0.2)",
                              cursor: "pointer",
                              boxSizing: "border-box"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#CC0000";
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 6px 18px rgba(255, 0, 0, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#FF0000";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 0, 0, 0.2)";
                            }}
                          >
                            <FaYoutube size={16} />
                            <span>▶ Watch on YouTube</span>
                          </a>
                        </div>
                      ))}
                      {getVideosForOrgan(selectedOrgan, selectedPart).length === 0 && (
                        <p style={{ color: "#94A3B8", fontSize: "13px" }}>No video guide available for this section.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Premium Floating Dock */}
            {!isFullscreen && (
              <div className="floating-dock">
                {[
                  { id: "overview", label: "Overview", icon: "📋" },
                  { id: "anatomy", label: "Anatomy", icon: "🧬" },
                  { id: "quiz", label: "Quiz", icon: "📝" },
                  { id: "comparison", label: "Comparison", icon: "🔄" },
                  { id: "videos", label: "Video Guide", icon: "🎥" }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === "comparison") {
                          setActivePanel(null);
                        } else {
                          setActivePanel(tab.id);
                        }
                      }}
                      className={`floating-dock-button ${isActive ? "active" : ""}`}
                    >
                      <span className="icon">{tab.icon}</span>
                      <span className="label">{tab.label}</span>
                    </button>
                  );
                })}
                <div style={{ width: "1px", height: "24px", background: "rgba(255, 255, 255, 0.1)", margin: "0 8px" }} />
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="floating-dock-button"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#22D3EE";
                    e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94A3B8";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="icon">⛶</span>
                  <span className="label">Focus Mode</span>
                </button>
                {selectedOrgan === "Heart" && (
                  <button
                    onClick={() => setIsBeating(!isBeating)}
                    className="floating-dock-button"
                    style={{ marginLeft: "8px", color: isBeating ? "#ef4444" : "#94A3B8" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="icon">{isBeating ? "⏹️" : "▶️"}</span>
                    <span className="label">{isBeating ? "Stop Beating" : "Play Beating"}</span>
                  </button>
                )}
              </div>
            )}

            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  position: "absolute",
                  top: "30px",
                  right: "40px",
                  background: "rgba(15, 23, 42, 0.65)",
                  backdropFilter: "blur(30px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 100,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  fontSize: "20px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.65)";
                }}
              >
                ✕
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ARViewer;