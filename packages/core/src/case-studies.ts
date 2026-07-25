export type FlytBaseCaseStudy = {
  id: string;
  title: string;
  industry: string;
  region: string;
  useCases: readonly string[];
  painPoints: readonly string[];
  proofPoints: readonly string[];
  recommendedEmailLine: string;
  url: string;
};

export const flytBaseCaseStudies = [
  {
    id: "enbw-solar-pv-inspections",
    title: "EnBW - Solar PV Inspections at Scale",
    industry: "Renewable Energy",
    region: "Europe",
    useCases: [
      "Solar PV inspection",
      "Autonomous drone dock operations",
      "Asset health monitoring",
    ],
    painPoints: [
      "Manual inspection programs struggled to scale across a fast-growing solar portfolio.",
      "Inspection coverage needed to expand from 150 MW toward 1 GW without linear headcount growth.",
      "Remote sites required repeatable flight operations with lower field-team dependency.",
    ],
    proofPoints: [
      "Positioned autonomous drone docks as the repeatable inspection layer for distributed solar assets.",
      "Supports scaling inspection workflows from 150 MW to 1 GW of solar PV capacity.",
      "Creates a path toward consistent, remote-first inspection cadence across large renewable sites.",
    ],
    recommendedEmailLine:
      "FlytBase helped EnBW think about scaling solar PV inspections from 150 MW toward 1 GW using autonomous drone docks.",
    url: "https://www.flytbase.com/case-studies/enbw-solar-pv-inspections",
  },
  {
    id: "sqm-mining-inspection-zone",
    title: "SQM - Autonomous Mining Inspection Zone",
    industry: "Mining",
    region: "Latin America",
    useCases: [
      "Mine site inspection",
      "Autonomous inspection zones",
      "Operational risk visibility",
    ],
    painPoints: [
      "Large mine sites made routine inspection coverage slow and resource intensive.",
      "Teams needed better visibility across high-value operational zones.",
      "Manual inspection routes increased exposure to harsh and remote site conditions.",
    ],
    proofPoints: [
      "Supports autonomous drone inspection workflows across large mining environments.",
      "Enables a defined autonomous inspection zone for repeatable monitoring.",
      "Improves inspection reach while reducing dependency on manual site traversal.",
    ],
    recommendedEmailLine:
      "For SQM, FlytBase framed autonomous inspection zones as a way to monitor large mine sites with less manual traversal.",
    url: "https://www.flytbase.com/case-studies/sqm-mining-inspection",
  },
  {
    id: "dole-asia-plantation-security",
    title: "Dole Asia - Plantation Security and ERP Visibility",
    industry: "Agriculture",
    region: "Asia Pacific",
    useCases: [
      "Plantation security",
      "Agricultural site monitoring",
      "ERP-integrated operations",
    ],
    painPoints: [
      "Large plantation areas were difficult to monitor consistently from the ground.",
      "Security events needed faster visibility and operational follow-through.",
      "Inspection and incident signals needed to connect back into enterprise workflows.",
    ],
    proofPoints: [
      "Applies autonomous drone monitoring to wide-area plantation security.",
      "Supports faster visibility into remote agricultural site activity.",
      "Connects drone-driven field intelligence into ERP-oriented operating workflows.",
    ],
    recommendedEmailLine:
      "Dole Asia is a useful parallel when discussing plantation security, wide-area monitoring, and ERP-connected response workflows.",
    url: "https://www.flytbase.com/case-studies/dole-asia-plantation-security",
  },
  {
    id: "uae-waste-management-environmental-monitoring",
    title: "UAE Waste Management Authority - Environmental Monitoring",
    industry: "Waste Management",
    region: "Middle East",
    useCases: [
      "Waste facility monitoring",
      "Environmental compliance",
      "Hazardous material detection",
    ],
    painPoints: [
      "Waste facilities required repeatable monitoring for environmental and safety risks.",
      "Hazardous conditions needed earlier detection across distributed operating areas.",
      "Manual rounds could miss emerging issues between scheduled inspections.",
    ],
    proofPoints: [
      "Frames autonomous drones as an always-ready monitoring layer for waste facilities.",
      "Supports environmental observation and hazardous-condition detection workflows.",
      "Improves inspection cadence for facilities with safety and compliance exposure.",
    ],
    recommendedEmailLine:
      "For environmental and waste-facility operators, the UAE Waste Management Authority example shows how autonomous monitoring can support hazardous detection and compliance visibility.",
    url: "https://www.flytbase.com/case-studies/uae-waste-management-authority",
  },
  {
    id: "slovakia-military-forest-wildfire-detection",
    title: "Slovakia Military Forest - Wildfire Detection",
    industry: "Forestry and Defense Land Management",
    region: "Europe",
    useCases: [
      "Wildfire detection",
      "Thermal imaging",
      "Autonomous forest monitoring",
    ],
    painPoints: [
      "Large forested areas needed continuous monitoring for early fire signals.",
      "Ground patrols could not cover every high-risk area with sufficient frequency.",
      "Thermal anomalies needed to be detected and escalated quickly.",
    ],
    proofPoints: [
      "Uses autonomous monitoring patterns for wide-area wildfire detection.",
      "Highlights thermal imaging as a key signal for early risk identification.",
      "Supports faster awareness across remote forest and military land areas.",
    ],
    recommendedEmailLine:
      "The Slovakia Military Forest story is relevant when a prospect cares about thermal imaging, early wildfire detection, and autonomous monitoring of remote land.",
    url: "https://www.flytbase.com/case-studies/slovakia-military-forest-wildfire",
  },
  {
    id: "shell-petroleum-infrastructure-inspections",
    title: "Shell Petroleum - Oil and Gas Infrastructure Inspections",
    industry: "Oil and Gas",
    region: "Global",
    useCases: [
      "Energy infrastructure inspection",
      "Asset monitoring",
      "Remote operations visibility",
    ],
    painPoints: [
      "Oil and gas infrastructure requires frequent inspection across safety-critical assets.",
      "Manual inspection routes can be slow, expensive, and exposure-heavy.",
      "Distributed sites need consistent visual intelligence for maintenance and risk teams.",
    ],
    proofPoints: [
      "Positions autonomous drones as a repeatable inspection layer for oil and gas assets.",
      "Supports remote visibility into infrastructure condition and operational risks.",
      "Helps reduce dependence on manual inspection for routine asset checks.",
    ],
    recommendedEmailLine:
      "Shell Petroleum is a strong reference point for oil and gas teams looking to inspect critical infrastructure with more consistent remote visibility.",
    url: "https://www.flytbase.com/case-studies/shell-petroleum-inspections",
  },
  {
    id: "csx-transportation-rail-risk-monitoring",
    title: "CSX Transportation - Rail Risk Mitigation",
    industry: "Transportation and Rail",
    region: "North America",
    useCases: [
      "Rail infrastructure monitoring",
      "Risk mitigation",
      "Operational incident visibility",
    ],
    painPoints: [
      "Rail infrastructure spans large corridors that are difficult to monitor from fixed locations.",
      "Risk teams need faster visibility into track, yard, and right-of-way conditions.",
      "Manual checks can delay awareness of infrastructure or safety issues.",
    ],
    proofPoints: [
      "Applies autonomous monitoring to rail risk mitigation and infrastructure visibility.",
      "Supports faster assessment of rail assets and operating areas.",
      "Improves situational awareness across distributed transportation infrastructure.",
    ],
    recommendedEmailLine:
      "CSX Transportation is a helpful proof point for rail operators focused on infrastructure monitoring and faster risk mitigation.",
    url: "https://www.flytbase.com/case-studies/csx-transportation-rail-monitoring",
  },
  {
    id: "premier-security-energy-perimeter-surveillance",
    title: "Premier Security - Energy Infrastructure Perimeter Surveillance",
    industry: "Security and Energy Infrastructure",
    region: "North America",
    useCases: [
      "Perimeter surveillance",
      "Energy infrastructure security",
      "Faster incident response",
    ],
    painPoints: [
      "Energy infrastructure sites need persistent perimeter visibility.",
      "Security teams must reduce response times when alerts or intrusions occur.",
      "Static cameras and manual patrols can leave visibility gaps around large sites.",
    ],
    proofPoints: [
      "Supports autonomous perimeter surveillance for energy infrastructure.",
      "Improves response workflows by getting eyes on alerts faster.",
      "Extends security coverage beyond fixed-camera blind spots and manual patrol routes.",
    ],
    recommendedEmailLine:
      "Premier Security is a relevant example when a prospect wants stronger perimeter surveillance and faster response for energy infrastructure.",
    url: "https://www.flytbase.com/case-studies/premier-security-energy-infrastructure",
  },
] as const satisfies readonly FlytBaseCaseStudy[];
