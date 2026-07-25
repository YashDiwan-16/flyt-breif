export type FlytBaseCaseStudyKnowledgeBaseEntry = {
  id: string;
  title: string;
  industry: string;
  useCases: readonly string[];
  painPoints: readonly string[];
  keywords: readonly string[];
  proofPoints: readonly string[];
  recommendedEmailLine: string;
  url: string;
  searchText: string;
};

export const flytBaseCaseStudyKnowledgeBase = [
  {
    id: "enbw-solar-pv-inspections",
    title: "EnBW - Solar PV Inspections at Scale",
    industry: "Renewable Energy",
    useCases: [
      "Solar PV inspection",
      "Autonomous drone dock operations",
      "Asset health monitoring",
      "Remote inspection programs",
    ],
    painPoints: [
      "Manual solar inspections could not scale efficiently across a growing renewable portfolio.",
      "Inspection coverage needed to expand from 150 MW toward 1 GW without linear field-team growth.",
      "Distributed solar sites needed repeatable, remote-first inspection cadence.",
    ],
    keywords: [
      "solar",
      "pv",
      "photovoltaic",
      "renewable energy",
      "solar farm",
      "solar inspection",
      "drone dock",
      "autonomous inspection",
      "asset monitoring",
      "scaling inspections",
    ],
    proofPoints: [
      "Supports scaling solar PV inspection workflows from 150 MW toward 1 GW.",
      "Positions autonomous drone docks as a repeatable inspection layer for distributed solar assets.",
      "Reduces dependency on manual site visits for routine renewable asset checks.",
    ],
    recommendedEmailLine:
      "FlytBase helped EnBW think about scaling solar PV inspections from 150 MW toward 1 GW using autonomous drone docks.",
    url: "https://www.flytbase.com/case-studies/enbw-solar-pv-inspections",
    searchText:
      "EnBW renewable energy solar PV photovoltaic inspections solar farm asset monitoring autonomous drone dock operations distributed sites scaling inspection coverage from 150 MW to 1 GW remote-first inspection cadence.",
  },
  {
    id: "sqm-mining-inspections",
    title: "SQM - 678 km² Autonomous Mining Inspection Zone",
    industry: "Mining",
    useCases: [
      "Mine site inspection",
      "Autonomous inspection zones",
      "Operational risk visibility",
      "Irrigation leak detection",
      "Leaching efficiency inspection",
      "Remote industrial monitoring",
    ],
    painPoints: [
      "A 678 km² mine made routine inspection coverage slow and resource intensive.",
      "Teams needed faster visibility into irrigation leaks and leaching inefficiencies.",
      "Manual inspection routes increased exposure to harsh and remote site conditions.",
    ],
    keywords: [
      "mining",
      "mine",
      "mine site",
      "inspection zone",
      "autonomous inspection",
      "industrial inspection",
      "remote monitoring",
      "operational risk",
      "large site",
      "678 km2",
      "iodine",
      "leaching",
      "irrigation leak",
      "adentu",
      "azure analytics",
      "hazardous environment",
    ],
    proofPoints: [
      "SQM used FlytBase with Adentu to automate inspections across a 678 km² northern Chile mining operation.",
      "The program cut inspection time from days to hours and doubled inspection frequency.",
      "The deployment achieved more than 95% mission reliability and supported a 2% iodine extraction yield improvement.",
    ],
    recommendedEmailLine:
      "SQM used FlytBase and Adentu to turn a 678 km² mining operation into an autonomous inspection ecosystem that moved inspections from days to hours.",
    url: "https://flytbase.com/case-studies/sqm-678-km2-mine-autonomous-inspection-adentu-and-flytbase",
    searchText:
      "SQM mining 678 km2 northern Chile autonomous inspections inspection zones Adentu FlytBase Azure analytics irrigation leaks leaching inefficiencies iodine yield mission reliability doubled inspection frequency days to hours hazardous terrain autonomous drone inspection.",
  },
  {
    id: "anglo-american-autonomous-mining-drones-peru",
    title: "Anglo American - Autonomous Mining Drones in Peru",
    industry: "Mining",
    useCases: [
      "Autonomous mining inspections",
      "Drone-in-a-box mine operations",
      "Photogrammetry data collection",
      "Dust monitoring",
      "Remote infrastructure inspection",
    ],
    painPoints: [
      "Manual aerial inspections at Quellaveco required specialized personnel and access to difficult terrain.",
      "The mining team needed scheduled inspections without on-site pilots.",
      "Aerial data collection needed a cleaner workflow into analysis tools such as Pix4D.",
    ],
    keywords: [
      "anglo american",
      "quellaveco",
      "peru",
      "mining",
      "mine",
      "autonomous drones",
      "drone-in-a-box",
      "scheduled inspections",
      "pix4d",
      "photogrammetry",
      "dust monitoring",
      "remote operations",
      "mine safety",
    ],
    proofPoints: [
      "FlytBase powered Anglo American Peru's autonomous drone-in-a-box deployment at the Quellaveco mine.",
      "The system performs scheduled aerial inspections of key infrastructure without on-site pilots.",
      "The deployment connects captured drone data into Pix4D Cloud for 3D maps and models.",
    ],
    recommendedEmailLine:
      "FlytBase powered Anglo American Peru's drone-in-a-box deployment at Quellaveco, moving scheduled mine inspections from manual missions to remote autonomy.",
    url: "https://flytbase.com/case-studies/anglo-american-autonomous-mining-drones-peru-case-study",
    searchText:
      "Anglo American Peru Quellaveco mining autonomous drones drone-in-a-box FlytBase scheduled aerial inspections infrastructure inspection remote operations Pix4D Cloud photogrammetry dust monitoring mine safety difficult terrain no on-site pilots.",
  },
  {
    id: "dole-asia-agriculture-security",
    title: "Dole Asia - Agriculture Security and ERP Visibility",
    industry: "Agriculture",
    useCases: [
      "Plantation security",
      "Agricultural site monitoring",
      "ERP-integrated operations",
      "Wide-area patrols",
    ],
    painPoints: [
      "Large plantation areas were difficult to monitor consistently from the ground.",
      "Security events needed faster visibility and operational follow-through.",
      "Inspection and incident signals needed to connect back into enterprise workflows.",
    ],
    keywords: [
      "agriculture",
      "plantation",
      "farm",
      "crop",
      "security",
      "perimeter",
      "erp",
      "enterprise workflow",
      "wide-area monitoring",
      "incident response",
    ],
    proofPoints: [
      "Applies autonomous drone monitoring to wide-area plantation security.",
      "Supports faster visibility into remote agricultural site activity.",
      "Connects drone-driven field intelligence into ERP-oriented operating workflows.",
    ],
    recommendedEmailLine:
      "Dole Asia is a useful parallel when discussing plantation security, wide-area monitoring, and ERP-connected response workflows.",
    url: "https://www.flytbase.com/case-studies/dole-asia-plantation-security",
    searchText:
      "Dole Asia agriculture plantation security crop farm monitoring wide-area patrols ERP integration enterprise workflows incident response remote agricultural site visibility autonomous drone monitoring.",
  },
  {
    id: "uae-waste-management-authority",
    title: "UAE Waste Management Authority - Environmental Monitoring",
    industry: "Waste Management",
    useCases: [
      "Waste facility monitoring",
      "Environmental compliance",
      "Hazardous material detection",
      "Safety risk monitoring",
    ],
    painPoints: [
      "Waste facilities required repeatable monitoring for environmental and safety risks.",
      "Hazardous conditions needed earlier detection across distributed operating areas.",
      "Manual rounds could miss emerging issues between scheduled inspections.",
    ],
    keywords: [
      "waste",
      "waste management",
      "environmental monitoring",
      "compliance",
      "hazardous",
      "hazard detection",
      "facility monitoring",
      "safety",
      "landfill",
      "environmental risk",
    ],
    proofPoints: [
      "Frames autonomous drones as an always-ready monitoring layer for waste facilities.",
      "Supports environmental observation and hazardous-condition detection workflows.",
      "Improves inspection cadence for facilities with safety and compliance exposure.",
    ],
    recommendedEmailLine:
      "For environmental and waste-facility operators, the UAE Waste Management Authority example shows how autonomous monitoring can support hazardous detection and compliance visibility.",
    url: "https://www.flytbase.com/case-studies/uae-waste-management-authority",
    searchText:
      "UAE Waste Management Authority waste facility monitoring environmental compliance hazardous detection landfill safety risk environmental risk autonomous drones repeatable monitoring hazardous material detection.",
  },
  {
    id: "slovakia-military-forest-wildfire-detection",
    title: "Slovakia Military Forest - Wildfire Detection",
    industry: "Forestry and Defense Land Management",
    useCases: [
      "Wildfire detection",
      "Thermal imaging",
      "Autonomous forest monitoring",
      "Remote land surveillance",
    ],
    painPoints: [
      "Large forested areas needed continuous monitoring for early fire signals.",
      "Ground patrols could not cover every high-risk area with sufficient frequency.",
      "Thermal anomalies needed to be detected and escalated quickly.",
    ],
    keywords: [
      "wildfire",
      "fire detection",
      "forest",
      "forestry",
      "thermal",
      "thermal imaging",
      "defense land",
      "remote monitoring",
      "autonomous monitoring",
      "early detection",
    ],
    proofPoints: [
      "Uses autonomous monitoring patterns for wide-area wildfire detection.",
      "Highlights thermal imaging as a key signal for early risk identification.",
      "Supports faster awareness across remote forest and military land areas.",
    ],
    recommendedEmailLine:
      "The Slovakia Military Forest story is relevant when a prospect cares about thermal imaging, early wildfire detection, and autonomous monitoring of remote land.",
    url: "https://www.flytbase.com/case-studies/slovakia-military-forest-wildfire",
    searchText:
      "Slovakia Military Forest wildfire detection forest fire thermal imaging autonomous monitoring defense land remote surveillance early detection thermal anomalies wide-area forest monitoring.",
  },
  {
    id: "shell-oil-gas-inspections",
    title: "Shell - Oil and Gas Infrastructure Inspections",
    industry: "Oil and Gas",
    useCases: [
      "Oil and gas infrastructure inspection",
      "Asset monitoring",
      "Remote operations visibility",
      "Safety-critical site inspection",
    ],
    painPoints: [
      "Oil and gas infrastructure requires frequent inspection across safety-critical assets.",
      "Manual inspection routes can be slow, expensive, and exposure-heavy.",
      "Distributed sites need consistent visual intelligence for maintenance and risk teams.",
    ],
    keywords: [
      "oil and gas",
      "petroleum",
      "energy infrastructure",
      "pipeline",
      "refinery",
      "asset inspection",
      "infrastructure inspection",
      "remote operations",
      "maintenance",
      "safety-critical",
    ],
    proofPoints: [
      "Positions autonomous drones as a repeatable inspection layer for oil and gas assets.",
      "Supports remote visibility into infrastructure condition and operational risks.",
      "Helps reduce dependence on manual inspection for routine asset checks.",
    ],
    recommendedEmailLine:
      "Shell is a strong reference point for oil and gas teams looking to inspect critical infrastructure with more consistent remote visibility.",
    url: "https://www.flytbase.com/case-studies/shell-petroleum-inspections",
    searchText:
      "Shell oil and gas petroleum infrastructure inspections pipeline refinery energy asset monitoring remote operations visibility maintenance safety-critical industrial inspection autonomous drones.",
  },
  {
    id: "csx-rail-infrastructure-monitoring",
    title: "CSX - Rail Infrastructure Monitoring",
    industry: "Transportation and Rail",
    useCases: [
      "Rail infrastructure monitoring",
      "Risk mitigation",
      "Operational incident visibility",
      "Right-of-way monitoring",
    ],
    painPoints: [
      "Rail infrastructure spans large corridors that are difficult to monitor from fixed locations.",
      "Risk teams need faster visibility into track, yard, and right-of-way conditions.",
      "Manual checks can delay awareness of infrastructure or safety issues.",
    ],
    keywords: [
      "rail",
      "railway",
      "transportation",
      "track",
      "rail yard",
      "right-of-way",
      "corridor monitoring",
      "infrastructure monitoring",
      "risk mitigation",
      "incident visibility",
    ],
    proofPoints: [
      "Applies autonomous monitoring to rail risk mitigation and infrastructure visibility.",
      "Supports faster assessment of rail assets and operating areas.",
      "Improves situational awareness across distributed transportation infrastructure.",
    ],
    recommendedEmailLine:
      "CSX is a helpful proof point for rail operators focused on infrastructure monitoring and faster risk mitigation.",
    url: "https://www.flytbase.com/case-studies/csx-transportation-rail-monitoring",
    searchText:
      "CSX rail railway transportation infrastructure monitoring track rail yard right-of-way corridor monitoring risk mitigation incident visibility autonomous drone monitoring distributed rail assets.",
  },
  {
    id: "premier-security-energy-infrastructure",
    title: "Premier Security - Energy Infrastructure Surveillance",
    industry: "Security and Energy Infrastructure",
    useCases: [
      "Perimeter surveillance",
      "Energy infrastructure security",
      "Faster incident response",
      "Intrusion visibility",
    ],
    painPoints: [
      "Energy infrastructure sites need persistent perimeter visibility.",
      "Security teams must reduce response times when alerts or intrusions occur.",
      "Static cameras and manual patrols can leave visibility gaps around large sites.",
    ],
    keywords: [
      "security",
      "perimeter",
      "surveillance",
      "intrusion",
      "energy infrastructure",
      "response time",
      "incident response",
      "patrol",
      "static camera",
      "site security",
    ],
    proofPoints: [
      "Supports autonomous perimeter surveillance for energy infrastructure.",
      "Improves response workflows by getting eyes on alerts faster.",
      "Extends security coverage beyond fixed-camera blind spots and manual patrol routes.",
    ],
    recommendedEmailLine:
      "Premier Security is a relevant example when a prospect wants stronger perimeter surveillance and faster response for energy infrastructure.",
    url: "https://www.flytbase.com/case-studies/premier-security-energy-infrastructure",
    searchText:
      "Premier Security energy infrastructure perimeter surveillance intrusion visibility site security response time incident response patrol static cameras autonomous drone security monitoring.",
  },
] as const satisfies readonly FlytBaseCaseStudyKnowledgeBaseEntry[];
